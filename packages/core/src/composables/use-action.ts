import type { Router } from 'vue-router'
import type { CollectionAction } from '@aeriajs/types'
import type { Store, GlobalStateManager } from '@aeria-ui/state-management'
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

const getEffect = (store: any, effectName: keyof typeof STORE_EFFECTS) => {
  const effect = STORE_EFFECTS[effectName]
  return store.$actions[effect]
}

export const useAction = <Filters extends { _id: string | string[] }>(
  store: Store,
  router: Router,
  manager: GlobalStateManager,
) => {
  const eventBus = reactive<ActionEvent>({
    id: -1,
    name: '',
    params: {},
  })

  const fn = (actionProps: Omit<CollectionAction<any>, 'label'> & { action: string }): (filters?: Filters)=> void => {
    const { action: actionName } = actionProps
    const actionEffect = actionProps.effect as keyof typeof STORE_EFFECTS | undefined
    const [scopeName, scopedAction] = actionName.split(/:(.*)/s)

    if( scopedAction ) {
      if( scopeName === 'route' ) {
        return async (filters?: Filters) => {
          if( actionProps.setItem ) {
            store.$actions.setItem(filters)
          }

          if( actionProps.clearItem ) {
            store.$actions.clearItem()
          }

          if( actionProps.fetchItem && filters?._id ) {
            await store.$actions.get({
              filters: {
                _id: filters._id,
              },
            })
          }

          router.push({
            name: actionName.split('route:')[1],
            params: filters
              ? Object.assign({
                id: filters._id,
              }, actionProps.params || {})
              : {},
            query: actionProps.query || {},
          })
        }
      }

      if( scopeName === 'ui' ) {
        return (_filters?: Filters) => {
          const filters = _filters
            ? deepClone(_filters)
            : {}
          Object.assign(eventBus, {
            id: Math.random(),
            name: scopedAction,
            params: filters,
          })
        }
      }
    }

    const prepareFilters = (filters?: Filters) => {
      return actionProps.requires
        ? store.$actions.select(actionProps.requires, filters)
        : store.$actions.select(['_id'], filters)
    }

    const storeAction = (() => {
      if( actionName in store.$actions ) {
        return store.$actions[actionName]
      }

      return actionEffect
        ? (payload: any) => store.$actions.customEffect(actionName, payload, (value: any) => {
          const effect = getEffect(store, actionEffect)
          if( !value || value._tag === 'Left' ) {
            return
          }

          const subject = value._tag === 'Right'
            ? value.value
            : value

          return effect(subject)
        })
        : (payload: any) => store.$actions.custom(actionName, payload)
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
