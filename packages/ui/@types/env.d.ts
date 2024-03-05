declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    instanceVars: typeof import('aeria-ui-build').InstanceConfig['site']
    currentUser: {
      _id: string
      name: string
    }
    formatDateTime: typeof import('@aeriajs/common').formatDateTime
  }
}

export {}
