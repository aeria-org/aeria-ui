import type { Description, Layout, PropertyValidationError, Property, LayoutName, TableLayout } from '@aeriajs/types'
import { computed, reactive, type ComputedRef } from 'vue'
import { useStore, useParentStore, type UnwrapGetters, type StoreContext, type GlobalStateManager, type StorePrototype } from '@aeria-ui/state-management'
import { deepMerge, isReference, getReferenceProperty } from '@aeriajs/common'
import { isDocumentComplete, deepDiff, condenseItem } from '@aeria-ui/utils'
import { PAGINATION_PER_PAGE_DEFAULT } from '../constants.js'
import { useStoreActions } from './actions.js'
import { isEmpty, normalizeActions, type NormalizedActions } from './helpers.js'

export type CollectionStoreItem = Record<string, unknown> & {
  _id: any
}

export type CollectionStoreState<TItem extends CollectionStoreItem = CollectionStoreItem> = InitialState<TItem> & UnwrapGetters<CollectionGetters<TItem>>

export type CollectionStore<TItem extends CollectionStoreItem = CollectionStoreItem> = CollectionStoreState<TItem> & {
  $id: string
  $functions: Record<
    string,
    <TFunction extends (...args: any[])=> unknown>(...args: Parameters<TFunction>)=> ReturnType<TFunction>
  >
  $actions: ReturnType<typeof useStoreActions>
}

export type InitialState<TItem extends CollectionStoreItem> = {
  rawDescription: Description
  item: TItem
  referenceItem: TItem
  freshItem: TItem
  diffedItem: Partial<TItem>
  items: TItem[]
  filters: Record<string, unknown>
  freshFilters: Record<string, unknown>
  activeFilters: Record<string, unknown>
  filtersPreset: Record<string, unknown>
  preferredTableProperties: string[]
  selected: TItem[] | string[]
  currentLayout?: LayoutName
  validationErrors: Record<string, PropertyValidationError>
  loading: Record<string, boolean>
  textQuery: string
  pagination: {
    offset: number
    limit: number
    recordsCount: number
    recordsTotal: number
  }

  transformers: Record<string, (value: unknown)=> unknown>
}

export type CollectionGetters<TItem extends CollectionStoreItem> = {
  $currentLayout: LayoutName
  $filters: Record<string, unknown>
  $freshItem: TItem
  actions: NormalizedActions
  condensedItem: unknown
  description: Description
  diffedItem: Partial<TItem>
  filtersCount: number
  hasActiveFilters: boolean
  hasSelectionActions: boolean
  individualActions: NormalizedActions
  isInsertReady: boolean
  itemsCount: number
  layout: Layout
  properties: Description['properties']
  references: [string, Property][]
  tableLayout: TableLayout<any>
  tableProperties: Record<string, Property>
} extends infer InferredGetters
  ? {
    [P in keyof InferredGetters]: ComputedRef<InferredGetters[P]>
  }
  : never

const internalCreateCollectionStore = <TItem extends CollectionStoreItem>() => {
  const item = <T>() => ({} as T)
  const initialState = reactive<InitialState<TItem>>({
    rawDescription: {} as Description,
    item: item(),
    referenceItem: item(),
    freshItem: item(),
    diffedItem: {},

    items: [],
    filters: {},
    freshFilters: {},
    activeFilters: {},
    filtersPreset: {},
    preferredTableProperties: [],
    selected: [],

    validationErrors: {},
    loading: {},
    textQuery: '',

    pagination: {
      offset: 0,
      limit: PAGINATION_PER_PAGE_DEFAULT,
      recordsCount: 0,
      recordsTotal: 0,
    },

    transformers: {},
  })

  const getters = (state: InitialState<TItem>, storeActions: Record<string, (...args: any[])=> unknown>): CollectionGetters<TItem> => {
    const description = computed((): Description => {
      if (state.rawDescription.preferred) {
        const userStore = useStore('user')
        const description = Object.assign({}, state.rawDescription)
        const toMerge = {}

        userStore.currentUser.roles.forEach((role: string) => {
          if (role in state.rawDescription.preferred!) {
            Object.assign(toMerge, deepMerge(toMerge, state.rawDescription.preferred![role]))
          }
        })

        Object.assign(description, deepMerge(description, toMerge, {
          arrays: false,
        }))
        return description
      }

      return state.rawDescription
    })

    const $filters = computed(() => {
      const expr = (key: string, value: unknown) => {
        const property = key in properties.value
          ? properties.value[key]
          : null

        const getValue = (value: unknown) => {
          if (!property) {
            return value
          }

          if ('type' in property) {
            if (property.type === 'boolean' && value === false) {
              return {
                $ne: true,
              }
            }

            if (property.type === 'string' && !property.format) {
              return {
                $regex: String(value)
                  .replace('(', '\\(')
                  .replace(')', '\\)'),
                $options: 'i',
              }
            }
          }

          return value && typeof value === 'object' && '_id' in value
            ? value._id
            : value
        }

        if (Array.isArray(value)) {
          return {
            $in: value.map((v) => getValue(v)),
          }
        }

        return getValue(value)
      }

      const sanitizedFilters: Record<string, unknown> = {}
      for( const [key, filter] of Object.entries(state.filters) ) {
        if (key.startsWith('$')) {
          sanitizedFilters[key] = filter
          continue
        }

        if( isEmpty(filter) ) {
          continue
        }

        if( Array.isArray(filter) ) {
          if( filter.length > 0 ) {
            sanitizedFilters[key] = expr(key, filter)
          }
          continue
        }

        if( filter.constructor !== Object ) {
          sanitizedFilters[key] = expr(key, filter)
          continue
        }

        const newFilter: Record<string, unknown> = {}
        for( const [key, value] of Object.entries(filter) ) {
          if( isEmpty(value) || (value.constructor === Object && Object.values(value).every((val) => isEmpty(val))) ) {
            continue
          }

          newFilter[key] = value
        }

        if( Object.keys(newFilter).length > 0 ) {
          sanitizedFilters[key] = expr(key, newFilter)
        }
      }

      return sanitizedFilters
    })

    const properties = computed(() => description.value.properties)
    const actions = computed(() => normalizeActions(description.value.actions))

    const diffedItem = computed(() => {
      const freshItem = state.rawDescription.freshItem
      const referenceItem = freshItem
        ? Object.fromEntries(Object.entries(state.referenceItem).map(([key, value]) => [
          key,
          key in freshItem
            ? null
            : value,
        ]))
        : state.referenceItem

      return deepDiff(
        referenceItem,
        state.item,
        {
          preserveIds: true,
        },
      ) as Partial<TItem>
    })

    return {
      description,
      properties,
      $filters,
      actions,
      individualActions: computed(() => normalizeActions(description.value.individualActions)),
      hasSelectionActions: computed(() => actions.value.some((action) => 'selection' in action && !!action.selection)),
      condensedItem: computed(() => condenseItem(state.item)),
      $freshItem: computed(() => {
        const recurse = (store: any, parent?: string, grandParent?: string): TItem => {
          const item: Record<string, unknown> = {}
          for( const key in properties.value ) {
            const property = properties.value[key]
            if( 'items' in property ) {
              item[key] = []

            } else if (isReference(property) && property.inline && store.$id !== grandParent) {
              const subject = getReferenceProperty(property)!.$ref
              const helperStore = useStore(subject)
              item[key] = recurse(helperStore, store.$id, parent)

            } else {
              item[key] = store.freshItem[key]
            }
          }

          return item as TItem
        }

        return recurse(state)
      }),
      itemsCount: computed(() => state.items.length),
      diffedItem,
      isInsertReady: computed(() => {
        const isComplete = isDocumentComplete(
          state.item,
          properties.value,
          description.value.required,
          description.value,
        )

        return state.item._id
          ? isComplete && Object.keys(diffedItem.value).length > 0
          : isComplete
      }),
      filtersCount: computed(() => Object.values($filters.value).filter((_) => !!_).length),
      hasActiveFilters: computed(() => Object.values(state.filters).some((_) => !!_)),
      references: computed(() => {
        return Object.entries(description.value.properties).filter(([, property]) => {
          return isReference(property) && property.inline
        })
      }),
      layout: computed(() => description.value.layout || {
        name: 'tabular',
        options: {},
      } satisfies Layout),
      $currentLayout: computed(() => state.currentLayout || (description.value.layout?.name || 'tabular')),
      tableProperties: computed(() => {
        const preferredProperties = state.preferredTableProperties.length > 0
          ? state.preferredTableProperties
          : description.value.table

        return preferredProperties
          ? storeActions.useProperties(preferredProperties) as Record<string, Property>
          : properties.value
      }),
      tableLayout: computed(() => description.value.tableLayout || {}),
    }
  }

  return {
    state: initialState,
    getters,
  }
}

export const createCollectionStore = <
  const TStoreId extends keyof Collections,
  TStoreState,
  TStoreGetters extends Record<string, (()=> unknown) | ComputedRef<unknown>> | {},
  TStoreActions extends Record<string, (...args: unknown[])=> unknown> | {},
>(
  newer: {
    $id: TStoreId
    state?: TStoreState
    getters?: (
      state: CollectionStoreState & TStoreState,
      actions: ReturnType<typeof useStoreActions> & TStoreActions
    )=> TStoreGetters
    actions?: (
      state: CollectionStoreState & TStoreState,
      actions: ReturnType<typeof useStoreActions>
    )=> TStoreActions
  },
  context: StoreContext,
) => {
  const initial = internalCreateCollectionStore<Collections[TStoreId]['item']>()
  const state: any = initial.state

  const actions = useStoreActions(state, context)
  if (newer.actions) {
    Object.assign(actions, newer.actions(state, actions))
  }
  if (newer.state) {
    Object.assign(state, newer.state)
  }

  Object.assign(state, initial.getters(state, actions))

  return {
    $id: newer.$id,
    state: state as InitialState<Collections[TStoreId]['item']> & (
      keyof TStoreState extends never
        ? {}
        : TStoreState
    ),
    getters: newer.getters?.(state, actions as never) as keyof TStoreGetters extends never
      ? undefined
      : TStoreGetters & ReturnType<typeof initial['getters']>,
    actions: actions as keyof TStoreActions extends never
      ? typeof actions
      : typeof actions & TStoreActions,
  } satisfies StorePrototype
}

export const useCollectionStore = (storeId: string, manager?: GlobalStateManager): CollectionStore => {
  return useStore(storeId, manager)
}

export const useParentCollectionStore = (storeId?: string, manager?: GlobalStateManager): CollectionStore => {
  return useParentStore(storeId, manager) as CollectionStore
}

