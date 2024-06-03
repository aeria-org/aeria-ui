import type { defineOptions } from './options.js'
import { isError } from '@aeriajs/common'
import { createApp } from 'vue'
import { useRouter } from 'vue-router'
import { createI18n, t } from '@aeria-ui/i18n'
import { createGlobalStateManager, type StoreContext } from '@aeria-ui/state-management'
import { routerInstance as createRouter } from './router.js'
import { templateFunctions } from './templateFunctions.js'
import { meta, user } from './stores/index.js'
import { STORAGE_NAMESPACE } from './constants.js'
import { bootstrapRoutes } from './bootstrap.js'
import registerDirectives from './directives/index.js'

export const useApp = async (optionsFn: ReturnType<typeof defineOptions>) => {
  const options = typeof optionsFn === 'function'
    ? await optionsFn()
    : optionsFn

  const {
    component,
    menuSchema,
    routes,

  } = options

  const app = createApp(component)
  registerDirectives(app)

  const globalStateManager = createGlobalStateManager()
  app.use(globalStateManager)

  const i18n = createI18n()
  app.use(i18n, options.i18n)

  const context: StoreContext = {
    i18n: i18n.__globalI18n,
    manager: globalStateManager,
  }

  const metaStore = meta(context)
  const userStore = user(context)

  const router = createRouter(routes || [], context)
  app.use(router)

  bootstrapRoutes(router, globalStateManager)

  if( options.setup ) {
    await options.setup({
      app,
      context,
    })
  }

  app.provide('menuSchema', menuSchema)

  app.mixin({
    computed: {
      instanceVars: () => INSTANCE_VARS,
      currentUser: () => userStore.currentUser,
      viewTitle: () => {
        const currentRoute = useRouter().currentRoute.value
        const title = currentRoute.meta.title as string

        if( !title ) {
          return
        }

        return title.replace(
          '%viewTitle%',
          t(currentRoute.params.collection as string, {
            plural: true,
          }),
        )
      },
      viewIcon: () => {
        const currentRoute = router.currentRoute.value
        return currentRoute.meta.icon
          || metaStore.descriptions[currentRoute.params.collection as string].icon
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
    } catch( err: any ) {
      hasError = true
      console.error(err)
    }

    if( hasError ) {
      const next = `${location.pathname}${location.search}`
      localStorage.removeItem(`${STORAGE_NAMESPACE}:auth`)

      if( router.currentRoute.value.path.startsWith('/user/signin') ) {
        localStorage.setItem(`${STORAGE_NAMESPACE}:auth:next`, next)
        router.push({
          name: '/user/signin',
          query: {
            next,
          },
        })
      } else {
        router.push({
          name: '/user/signin',
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

