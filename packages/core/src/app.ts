import type { defineOptions } from './options.js'
import { createApp, ref } from 'vue'
import { t } from '@aeria-ui/i18n'
import { isError } from '@aeriajs/common'
import { routerInstance as createRouter } from './router.js'
import { templateFunctions } from './templateFunctions.js'
import { STORAGE_NAMESPACE } from './constants.js'
import { bootstrapApp, bootstrapRoutes } from './bootstrap.js'
import { MENU_SCHEMA_SYMBOL } from './types.js'

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
    })
  }

  app.provide(MENU_SCHEMA_SYMBOL, reactiveMenuSchema)

  app.mixin({
    computed: {
      currentUser: () => userStore.currentUser,
      viewTitle: () => {
        const currentRoute = router.currentRoute.value
        const title = currentRoute.meta.title

        if( typeof title !== 'string' ) {
          return
        }

        if( typeof currentRoute.params.collection === 'string' ) {
          return title.replace(
            '%viewTitle%',
            t(currentRoute.params.collection, {
              plural: true,
            }, i18n),
          )
        }

        return title
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

  if( userStore.signedIn || /^\/dashboard(\/|$)/.test(location.pathname) ) {
    let hasError = false

    try {
      const result = await metaStore.$actions.describe({
        roles: true,
        revalidate: true,
      })

      if( isError(result) ) {
        hasError = true
      }
    } catch( err ) {
      hasError = true
      console.error(err)
    }

    if( hasError ) {
      userStore.$actions.signout()

      if( !router.currentRoute.value.path.startsWith('/user/signin') ) {
        const next = `${location.pathname}${location.search}`
        if( typeof localStorage !== 'undefined' ) {
          localStorage.setItem(`${STORAGE_NAMESPACE}:auth:next`, next)
        }

        router.push({
          name: '/user/signin',
          query: {
            next,
          },
        })
      }
    }

  }

  return {
    app,
    router,
    mount: () => app.mount('#app'),
  }
}

