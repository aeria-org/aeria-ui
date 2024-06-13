declare module '@aeria-ui/state-management' {
  export * from '@aeria-ui/state-management/dist'
  export function useStore(storeId: 'meta'): ReturnType<typeof import('@aeria-ui/core').meta>
  export function useStore(storeId: 'user'): ReturnType<typeof import('@aeria-ui/core').user>
}

