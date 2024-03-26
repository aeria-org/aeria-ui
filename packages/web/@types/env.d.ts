interface ImportMeta {
  env?: Record<
    | 'AERIA_STORAGE_NAMESPACE'
    | 'AERIA_API_URL'
  , string>
}

declare module 'vue-router/auto' {
  import {
    createRouter as cr,
    createWebHistory,
    useRouter,
    Router,
    RouteRecordRaw
  } from 'vue-router'

  export const createRouter: (config: Omit<Parameters<typeof cr>[0], 'routes'> & {
    extendRoutes: (routes: RouteRecordRaw[]) => RouteRecordRaw[]
  }) => Router

  export {
    Router,
    RouteRecordRaw,
    createWebHistory,
    useRouter,
  }
}

var I18N: typeof import('@aeria-ui/i18n').I18nConfig
var INSTANCE_VARS: import('aeria-ui-build').InstanceConfig['site']

