import type { I18nConfig } from '@aeria-ui/i18n'
import {
  inject,
  unref,
  isReactive,
  reactive,
  computed,
  type Ref,
  type UnwrapRef,
  type ComputedRef,
  type Plugin,

} from 'vue'

export type StoreState = Record<string, any>

export type Store = StoreState & {
  $id: string
  $actions: Record<string, (...args: any[])=> any>
  $functions: Record<string, (...args: any[])=> any>
}

export type GlobalState = Record<string, Store>
export type GlobalStateManager = {
  __globalState: GlobalState
}

export type UnwrapGetters<TGetters extends Record<string, (()=> any) | ComputedRef<any>>> = {
  [P in keyof TGetters]: TGetters[P] extends ()=> infer Value
    ? Value
    : UnwrapRef<TGetters[P]>
}

export type StoreContext<T = {}> = T & {
  i18n: I18nConfig
  manager: GlobalStateManager
}

export const GLOBAL_STATE_KEY = Symbol('globalState')
export const STORE_ID = Symbol('storeId')

export const createGlobalStateManager = (): GlobalStateManager & Plugin => {
  const globalState: GlobalState = {}

  return {
    __globalState: globalState,
    install(app) {
      app.provide(GLOBAL_STATE_KEY, globalState)
    },
  }
}

export const getGlobalStateManager = () => {
  return {
    __globalState: inject(GLOBAL_STATE_KEY, {} as GlobalState),
  }
}

export const getGlobalState = (manager: GlobalStateManager) => {
  return manager.__globalState
}

export const getStoreId = () => {
  return inject<Ref<string> | string | null>(STORE_ID, null)
}

export const useStore = (storeId: string, manager?: GlobalStateManager) => {
  const globalState = getGlobalState(manager || getGlobalStateManager())

  if( !(storeId in globalState) ) {
    throw new Error(`tried to invoke unregistered store "${storeId}"`)
  }

  return globalState[storeId]
}

export const useParentStore = (fallback?: string, manager?: GlobalStateManager) => {
  let parentStoreId = getStoreId()
  if( !parentStoreId ) {
    if( !fallback ) {
      throw new Error('no parent store found')
    }

    parentStoreId = fallback
  }

  return useStore(
    unref(parentStoreId),
    manager,
  )
}

export const hasStore = (storeId: string, manager?: GlobalStateManager) => {
  const globalState = getGlobalState(manager || getGlobalStateManager())
  return storeId in globalState
}

export const internalRegisterStore = <
  const TStoreId extends string,
  TStoreState extends StoreState,
  TStoreGetters extends Record<string, (()=> any) | ComputedRef<any>>,
  TStoreActions extends Record<string, (...args: any[])=> any>,
>(
  context: StoreContext,
  fn: (context: StoreContext)=> {
    $id: TStoreId
    state: TStoreState
    getters?: TStoreGetters,
    actions?: TStoreActions
  },
) => {
  const { manager } = context
  const { $id, state, getters, actions } = fn(context)
  const globalState = manager.__globalState

  if( hasStore($id, manager) ) {
    return globalState[$id]
  }

  const store = isReactive(state)
    ? <Store>state
    : reactive(<Store>state)

  Object.assign(store, {
    $id,
  })

  if( getters ) {
    Object.assign(
      store,
      Object.fromEntries(Object.entries(getters).map(([key, getter]) => [
        key,
        typeof getter === 'function'
          ? computed(getter)
          : getter,
      ])),
    )
  }

  if( actions ) {
    const functions = new Proxy({}, {
      get: (_target, verb: string) => {
        return (...args: any[]) => actions.custom(verb, ...args)
      },
    })

    const proxiedActions = new Proxy(actions, {
      get: (target, key: string) => {
        if( typeof target[key] !== 'function' ) {
          return target[key]
        }
        return target[key].bind({
          ...actions,
          $functions: functions,
        })
      },
    })

    Object.defineProperty(store, '$actions', {
      value: proxiedActions,
      writable: true,
    })

    Object.defineProperty(store, '$functions', {
      value: functions,
      writable: true,
    })
  }

  globalState[$id] = store
  return store
}

export const registerStore = <
  const TStoreId extends string,
  TStoreState extends StoreState,
  TStoreGetters extends Record<string, (()=> any) | ComputedRef<any>> | undefined,
  TStoreActions extends Record<string, (...args: any[])=> any>,
  Return = TStoreState & (keyof TStoreGetters extends never ? {} : UnwrapGetters<NonNullable<TStoreGetters>>) & {
    $id: TStoreId,
    $actions: TStoreActions
    $functions: Record<string, (...args: any[])=> any>
  },

>(
  fn: (context: StoreContext)=> {
    $id: TStoreId
    state: TStoreState
    getters?: TStoreGetters,
    actions?: TStoreActions
  },
) => {
  return (context: StoreContext) => {
    return internalRegisterStore(context, fn) as Return
  }
}

