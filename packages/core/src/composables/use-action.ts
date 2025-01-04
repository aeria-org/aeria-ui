import type { Router, LocationQueryRaw, RouteParamsRaw } from 'vue-router'
import type { CollectionAction } from '@aeriajs/types'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import type { CollectionStore, CollectionStoreItem } from '../state/collection.js'
import { useStore } from '@aeria-ui/state-management'
import { useI18n } from '@aeria-ui/i18n'
import { Result } from '@aeriajs/types'
import { deepClone } from '@aeriajs/common'
import { reactive } from 'vue'

export const STORE_EFFECTS = {
  'ITEM_SET': 'setItem',
  'ITEM_INSERT': 'insertItem',
  'ITEMS_SET': 'setItems',
  'ITEMS_UPDATE': 'updateItems',
  'ITEM_REMOVE': 'removeItem',
} as const

export type ActionEvent = {
  id: number
  name: string
  params: any
}

const getEffect = (store: Pick<CollectionStore, '$actions'>, effectName: keyof typeof STORE_EFFECTS) => {
  const effect = STORE_EFFECTS[effectName]
  return store.$actions[effect] as (payload: unknown)=> unknown
}

export const useAction = (
  store: Pick<CollectionStore, '$actions' | 'rawDescription'>,
  router: Router,
  manager: GlobalStateManager,
) => {
  const eventBus = reactive<ActionEvent>({
    id: -1,
    name: '',
    params: {},
  })

  const fn = (actionProps: CollectionAction<any> & { action: string }): (filters?: CollectionStoreItem)=> void => {
    const metaStore = useStore('meta', manager)
    const { t } = useI18n()
    const { action: actionName } = actionProps

    if( 'route' in actionProps ) {
      return async (filters?: CollectionStoreItem) => {
        if( filters && actionProps.route.setItem ) {
          store.$actions.setItem(filters)
        }

        if( actionProps.route.clearItem ) {
          store.$actions.clearItem()
        }

        if( actionProps.route.fetchItem && filters?._id ) {
          const { error } = await store.$actions.get({
            filters: {
              _id: filters._id,
            },
          })

          if( error ) {
            metaStore.$actions.spawnToast({
              icon: 'warning',
              text: t('failed_to_fetch'),
            })
            return Result.error(error)
          }
        }

        const params = actionProps.route.params || {}
        if( filters ) {
          params.id = filters._id
        }

        params.collection = store.rawDescription.$id
        router.push({
          name: actionProps.route.name,
          query: actionProps.route.query as LocationQueryRaw | undefined || {},
          params: params as RouteParamsRaw,
        })
      }
    }

    if( 'event' in actionProps ) {
      return (_filters?: CollectionStoreItem) => {
        const filters = _filters
          ? deepClone(_filters)
          : {}
        Object.assign(eventBus, {
          id: Math.random(),
          name: actionProps.event,
          params: filters,
        })
      }
    }

    const prepareFilters = (filters?: CollectionStoreItem) => {
      return actionProps.requires
        ? store.$actions.select(actionProps.requires.filter((propName) => typeof propName === 'string'), filters)
        : store.$actions.select(['_id'], filters)
    }

    const storeAction = (() => {
      const functionName = 'function' in actionProps && actionProps.function
        ? actionProps.function
        : actionName

      if( functionName in store.$actions ) {
        return store.$actions[functionName as keyof typeof store.$actions] as (...args: unknown[])=> unknown
      }

      return 'effect' in actionProps && actionProps.effect
        ? async (payload: unknown) => {
          const { error, result } = await store.$actions.custom<Result.Either<unknown, unknown>>(actionName, payload)
          const effect = getEffect(store, actionProps.effect as keyof typeof STORE_EFFECTS)
          if( error ) {
            return
          }

          return effect(result)

        }
        : (payload: unknown) => store.$actions.custom(actionName, payload)
    })()

    if( actionProps.ask ) {
      return (filters?: CollectionStoreItem) => metaStore.$actions.ask({
        action: storeAction,
        params: prepareFilters(filters),
      })
    }

    return (filters?: CollectionStoreItem) => storeAction(prepareFilters(filters))
  }

  return [
    fn,
    eventBus,
  ] as const
}
