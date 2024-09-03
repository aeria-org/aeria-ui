declare module '@aeria-ui/state-management' {
    export * from '@aeria-ui/state-management/dist'
    export function useStore(storeId: 'meta', manager?: import('@aeria-ui/state-management').GlobalStateManager): ReturnType<typeof import('../src/stores/index.js').meta>
    export function useStore(storeId: 'user', manager?: import('@aeria-ui/state-management').GlobalStateManager): ReturnType<typeof import('../src/stores/index.js').user>
    export function useStore(storeId: string, manager?: import('@aeria-ui/state-management').GlobalStateManager): CollectionStore
}
