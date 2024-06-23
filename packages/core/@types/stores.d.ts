declare module '@aeria-ui/state-management' {
    export * from '@aeria-ui/state-management/dist'
    export function useStore(storeId: 'meta'): ReturnType<typeof import('../src/stores/index.js').meta>
    export function useStore(storeId: 'user'): ReturnType<typeof import('../src/stores/index.js').user>
    export function useStore(storeId: string, manager?: GlobalStateManager): CollectionStore
}
