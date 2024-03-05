import type { defineOptions } from './options.js'
import { isLeft } from '@aeriajs/common'
import { createApp } from 'vue'
import { useRouter } from 'vue-router'
import { createI18n, t } from '@aeria-ui/i18n'
import { createGlobalStateManager } from '@aeria-ui/state-management'
import { routerInstance as createRouter } from './router.js'
import { templateFunctions } from './templateFunctions.js'
import { meta, user } from './stores/index.js'
import { STORAGE_NAMESPACE } from './constants.js'
import { bootstrapRoutes } from './bootstrap.js'
import registerDirectives from './directives/index.js'

export type * from './templateFunctions.js'

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

  const router = createRouter(routes || [], globalStateManager)
  app.use(router)

  const metaStore = meta(globalStateManager)
  const userStore = user(globalStateManager)

  bootstrapRoutes(router, globalStateManager)

  if( options.i18n ) {
    createI18n(options.i18n)
  }

  if( options.setup ) {
    await options.setup({
      app,
      globalStateManager,
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
      const resultEither = await metaStore.$actions.describe({
        roles: true,
        revalidate: true,
      })

      if( isLeft(resultEither) ) {
        hasError = true
      }
    } catch( err: any ) {
      hasError = true
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

