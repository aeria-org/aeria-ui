declare module '@aeria-ui/state-management' {
    export * from '@aeria-ui/state-management/dist'
    export function useStore(storeId: 'meta', manager?: GlobalStateManager): ReturnType<typeof import('@aeria-ui/core').meta>
    export function useStore(storeId: 'user', manager?: GlobalStateManager): ReturnType<typeof import('@aeria-ui/core').user>
    export function useStore(storeId: string, manager?: GlobalStateManager): CollectionStore
}
