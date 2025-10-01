import type { defineOptions } from './options.js'
import { createApp, ref } from 'vue'
import { t } from '@aeria-ui/i18n'
import { routerInstance as createRouter } from './router.js'
import { templateFunctions } from './templateFunctions.js'
import { bootstrapApp, bootstrapRoutes } from './bootstrap.js'
import { MENU_SCHEMA_SYMBOL, type RouteTitleConfig } from './types.js'

export const useApp = async (optionsFn: ReturnType<typeof defineOptions>) => {
  const options = typeof optionsFn === 'function'
    ? await optionsFn()
    : optionsFn

  const {
    component,
    menuSchema,
    routes = [],
  } = options

  const app = createApp(component)
  const { context, i18n, metaStore, userStore } = bootstrapApp({
    app,
    instanceVars: typeof INSTANCE_VARS === 'undefined'
      ? {}
      : INSTANCE_VARS,
    i18n: options.i18n,
  })

  const router = createRouter(routes, context)
  app.use(router)

  const reactiveMenuSchema = ref(menuSchema)

  if( menuSchema ) {
    bootstrapRoutes(router, context)
  } else {
    bootstrapRoutes(router, context, () => {
      reactiveMenuSchema.value = router.getRoutes().flatMap((route) => {
        return typeof route.name === 'string' && route.meta.collection
          ? route.name
          : []
      })
    })
  }

  if( options.setup ) {
    await options.setup({
      app,
      context,
      router,
    })
  }

  app.provide(MENU_SCHEMA_SYMBOL, reactiveMenuSchema)

  app.mixin({
    computed: {
      currentUser: () => userStore.currentUser,
      viewTitle: () => {
        const currentRoute = router.currentRoute.value
        const titleConfig = currentRoute.meta.title as RouteTitleConfig

        if( typeof titleConfig === 'string' ) {
          return titleConfig
        }

        return titleConfig({
          collectionName: currentRoute.params.collection as string,
          t: (text, options, _i18n) => {
            return t(text, options, _i18n || i18n)
          },
        })
      },
      viewIcon: () => {
        const currentRoute = router.currentRoute.value
        if( currentRoute.meta.icon ) {
          return currentRoute.meta.icon
        }

        if( typeof currentRoute.params.collection === 'string' ) {
          if( currentRoute.params.collection in metaStore.descriptions ) {
            const description = metaStore.descriptions[currentRoute.params.collection]
            return description.icon
          }
        }
      },
    },
    methods: templateFunctions,
  })

  if( typeof window !== 'undefined' ) {
    Object.assign(window, {
      ROUTER: router,
    })
  }

  return {
    app,
    router,
    mount: () => app.mount('#app'),
  }
}

