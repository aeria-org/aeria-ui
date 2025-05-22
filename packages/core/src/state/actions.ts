import type { EndpointError, Property, GetAllReturnType, PropertyValidationError } from '@aeriajs/types'
import type { StoreContext } from '@aeria-ui/state-management'
import { getReferenceProperty, deepClone, isReference } from '@aeriajs/common'
import { formatValue, condenseItem } from '@aeria-ui/utils'
import { Result } from '@aeriajs/types'
import { t } from '@aeria-ui/i18n'
import { API_URL } from '../constants.js'
import { request } from '../http.js'
import { useCollectionStore, type CollectionStore, type CollectionStoreItem } from './collection.js'
import { recurseInsertCandidate } from './recurseInsertCandidate.js'

export type CrudParameters = {
  filters: Record<string, unknown>
  limit: number
  offset: number
  project?: string[]
}

export type ActionFilter = Partial<CrudParameters>

export type CustomOptions = {
  method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
  skipLoading?: boolean
  skipEffect?: boolean
  insert?: boolean
}

export const useStoreActions = (store: CollectionStore, context: StoreContext) => {
  const { manager } = context
  const actions = {
    setItem(item: typeof store['item']) {
      for( const key in store.item ) {
        store.item[key] = undefined
      }

      Object.assign(store.item, deepClone(store.freshItem))
      Object.entries(item).forEach(([key, value]) => {
        if( value !== null ) {
          store.item[key] = value
        }
      })

      store.referenceItem = deepClone(item)

      return item
    },

    setItems(items: typeof store['items']) {
      store.items.splice(0)
      store.items.push(...items)
      return items
    },

    insertItem(_item: typeof store['item'], options?: { merge?: boolean }) {
      const old = options?.merge
        ? Object.assign({}, store.item)
        : {}

      const item = Object.assign(old, _item)
      actions.setItem(item)

      if( item._id ) {
        const found = store.items.find(({ _id }) => _id === item._id)
        if( found ) {
          for( const key in found ) {
            found[key] = undefined
          }
          Object.assign(found, deepClone(store.freshItem))
          Object.assign(found, item)
          return item
        }
      } else {
        store.pagination.recordsCount++
      }

      store.items.unshift(item)
      return item
    },

    removeItem({ error, result: subject }: Result.Either<EndpointError, typeof store['item']>) {
      if(error) {
        return Result.error(error)
      }

      store.items = store.items.filter(({ _id }) => {
        if( Array.isArray(subject) ) {
          return !subject.find((sub) => sub._id === _id)
        }

        return subject._id !== _id
      })
      if( store.item._id === subject._id ) {
        store.item._id = null
      }

      return Result.result(subject)
    },

    clearItem() {
      Object.keys(store.item).forEach((key) => {
        delete store.item[key]
      })

      return actions.setItem({})
    },

    clearItems() {
      return store.items.splice(0)
    },

    async custom<TResponseType = unknown>(verb: string | null, payload?: unknown, options?: CustomOptions): Promise<TResponseType> {
      store.validationErrors = {}
      if( !options?.skipLoading ) {
        if( verb ) {
          store.loading[verb] = true
        }
      }

      const route = verb
        ? `${store.$id}/${verb}`
        : store.$id

      const promise = request<TResponseType>(`${API_URL}/${route}`, payload).finally(() => {
        if( !options?.skipLoading ) {
          if( verb ) {
            store.loading[verb] = false
          }
        }
      })

      const data = (await promise).data
      if( options?.insert ) {
        if( !data || typeof data !== 'object' || !('result' in data) ) {
          throw new Error
        }
        actions.insertItem(data.result as CollectionStoreItem)
      }

      return data
    },

    count(payload: Pick<CrudParameters, 'filters'>) {
      return actions.custom('count', payload)
    },

    async get(payloadSource: ActionFilter | string, options?: CustomOptions): Promise<Result.Either<EndpointError, typeof store['item']>> {
      const payload = typeof payloadSource === 'string'
        ? {
          filters: {
            _id: payloadSource,
          },
        }
        : payloadSource

      const { error, result } = await actions.custom<Result.Either<EndpointError, CollectionStoreItem>>('get', payload, options)
      if( error ) {
        return Result.error(error)
      }

      actions.setItem(result)
      return Result.result(result)
    },

    retrieveItems(payload?: ActionFilter) {
      return actions.custom<GetAllReturnType<{}>>('getAll', payload)
    },

    async getAll(_payload?: ActionFilter): Promise<Result.Either<EndpointError, typeof store['item'][]>> {
      const payload = Object.assign({}, _payload || {})

      if( typeof payload.limit !== 'number' ) {
        payload.limit = store.pagination.limit
      }

      if( typeof payload.offset !== 'number' ) {
        payload.offset = store.pagination.offset
      }

      const { error, result } = await actions.retrieveItems(payload)
      if( error ) {
        return Result.error(error)
      }

      actions.setItems(result.data)
      Object.assign(store.pagination, result.pagination)

      return Result.result(result.data)
    },

    async insert(payload?: { what: Partial<typeof store['item']> }, options?: CustomOptions) {
      const { error, result } = await actions.custom<Result.Either<EndpointError, CollectionStoreItem>>('insert', {
        ...payload,
        what: payload?.what || store.item,
      }, options)

      if( error ) {
        switch( error.code ) {
          case 'INVALID_PROPERTIES':
          case 'MISSING_PROPERTIES': {
            if( 'details' in error ) {
              store.validationErrors = error.details as Record<string, PropertyValidationError>
            }
          }
        }

        return Result.error(error)
      }

      return Result.result(actions.insertItem(result))
    },

    async deepInsert(payload?: { what: Partial<typeof store['item']> }, options?: CustomOptions) {
      const candidate = Object.assign({}, payload?.what || store.diffedItem)

      const { error, result: newItem } = await recurseInsertCandidate(candidate, store.description as unknown as Property, manager)
      if( error ) {
        return Result.error(error)
      }

      return actions.insert({
        what: condenseItem(newItem) as Record<string, unknown>,
      }, options)
    },

    async remove(payload: ActionFilter['filters'], options?: CustomOptions) {
      const result = await actions.custom<Result.Either<EndpointError, CollectionStoreItem>>(
        'remove', {
          filters: {
            _id: payload?._id,
          },
        },
        options,
      )

      return actions.removeItem(result)
    },

    // @TODO: implement effect
    async removeAll(payload: ActionFilter['filters'], options?: CustomOptions) {
      return actions.custom<Result.Either<EndpointError, unknown>>(
        'removeAll', {
          filters: {
            _id: payload?._id,
          },
        },
        options,
      )

      // return actions.removeItem(result)
    },

    filter(props?: ActionFilter) {
      store.activeFilters = props?.filters || store.$filters
      const payload = {
        filters: {
          ...store.activeFilters,
          ...store.filtersPreset,
        },
        limit: store.pagination.limit,
      }

      if( props ) {
        Object.assign(payload, props)
      }

      return actions.getAll(payload)
    },

    updateItems() {
      return actions.filter()
    },

    clearFilters() {
      const filters = store.filters = deepClone(store.freshFilters)
      store.pagination.offset = 0
      return filters
    },

    useProperties(properties: (keyof typeof store['properties'])[]) {
      return properties.reduce((a, property) => {
        if( !(property in store.properties) ) {
          return a
        }

        return {
          ...a,
          [property]: store.properties[property],
        }

      }, {})
    },

    usePropertiesExcept(properties: (keyof typeof store['properties'])[]) {
      return Object.fromEntries(Object.entries(store.properties)
        .filter(([key]) => !properties.includes(key)))
    },

    formatValue(args: {
      value: string | Record<string, unknown> | (string | Record<string, unknown>)[],
      key: string,
      form?: boolean,
      property: Property,
      index?: string
    }): unknown {
      const value = args.property.translate && typeof args.value === 'string'
        ? t(args.value, {
          capitalize: true,
        }, context.i18n)
        : args.value

      if( args.key in store.transformers ) {
        return store.transformers[args.key](value)
      }

      if( isReference(args.property) ) {
        const index = args.index || args.property.indexes?.[0]

        const helperStore = useCollectionStore(getReferenceProperty(args.property)!.$ref, manager)
        const property = index
          ? helperStore.description.properties[index]
          : undefined

        if( property && isReference(property) ) {
          let refVal: typeof value
          if( Array.isArray(args.value) ) {
            refVal = args.value.map((value) => {
              return typeof value === 'string'
                ? value
                : String(value[index!])
            })
          } else if( typeof args.value === 'string' ) {
            refVal = value
          } else {
            refVal = String(args.value[index!])
          }

          return helperStore.$actions.formatValue({
            property,
            index,
            key: args.key,
            value: refVal,
          })
        }
      }

      return formatValue(
        value,
        args.property,
        args.index,
      )
    },

    select(properties: (keyof typeof store['properties'])[], item?: typeof store['item']) {
      return Object.entries(item || store.item).reduce((a, [key, value]) => {
        if( !properties.includes(key) ) {
          return a
        }

        return {
          ...a,
          [key]: value,
        }
      }, {})
    },

    selectManyItems(items: typeof store['items'], value?: boolean) {
      if( value ) {
        store.selected = items
      }

      return items
    },

    selectAllItems(state?: boolean) {
      store.selected = state
        ? store.items.map((item) => item._id as string)
        : []

      return store.items
    },
  }

  return actions
}
