import type { Router } from 'vue-router'
import type { CollectionAction, Result } from '@aeriajs/types'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import type { CollectionStore } from '@aeria-ui/core'
import { useStore } from '@aeria-ui/state-management'
import { reactive } from 'vue'
import { deepClone } from '@aeriajs/common'

export const STORE_EFFECTS = <const>{
  'ITEM_SET': 'setItem',
  'ITEM_INSERT': 'insertItem',
  'ITEMS_SET': 'setItems',
  'ITEMS_UPDATE': 'updateItems',
  'ITEM_REMOVE': 'removeItem',
}

export type ActionEvent = {
  id: number
  name: string
  params: any
}

const getEffect = (store: CollectionStore, effectName: keyof typeof STORE_EFFECTS) => {
  const effect = STORE_EFFECTS[effectName]
  return store.$actions[effect]
}

export const useAction = <Filters extends { _id: string | string[] }>(
  store: CollectionStore,
  router: Router,
  manager: GlobalStateManager,
) => {
  const eventBus = reactive<ActionEvent>({
    id: -1,
    name: '',
    params: {},
  })

  const fn = (actionProps: CollectionAction<any> & { action: string }): (filters?: Filters)=> void => {
    const { action: actionName } = actionProps

    if( 'route' in actionProps ) {
      return async (filters?: Filters) => {
        if( actionProps.route.setItem ) {
          store.$actions.setItem(filters)
        }

        if( actionProps.route.clearItem ) {
          store.$actions.clearItem()
        }

        if( actionProps.route.fetchItem && filters?._id ) {
          await store.$actions.get({
            filters: {
              _id: filters._id,
            },
          })
        }

        const params = actionProps.route.params || {}
        if( filters ) {
          params.id = filters._id
        }

        params.collection = store.description.$id
        router.push({
          name: actionProps.route.name,
          query: actionProps.route.query || {},
          params,
        })
      }
    }

    if( 'event' in actionProps ) {
      return (_filters?: Filters) => {
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

    const prepareFilters = (filters?: Filters) => {
      return actionProps.requires
        ? store.$actions.select(actionProps.requires.filter((propName) => typeof propName === 'string'), filters)
        : store.$actions.select(['_id'], filters)
    }

    const storeAction = (() => {
      const functionName = 'function' in actionProps && actionProps.function
        ? actionProps.function
        : actionName

      if( functionName in store.$actions ) {
        return Object.getOwnPropertyDescriptor(store.$actions, functionName)!.value
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
      const metaStore = useStore('meta', manager)
      return (filters?: Filters) => metaStore.$actions.ask({
        action: storeAction,
        params: prepareFilters(filters),
      })
    }

    return (filters?: Filters) => storeAction(prepareFilters(filters))
  }

  return <const>[
    fn,
    eventBus,
  ]
}
