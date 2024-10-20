import type { InstanceConfig } from '@aeria-ui/cli'
import type { Router } from 'vue-router'
import { watch, type App } from 'vue'
import { useStore, createGlobalStateManager, type StoreContext } from '@aeria-ui/state-management'
import { createI18n, type I18nConfig } from '@aeria-ui/i18n'
import { meta, user } from './stores/index.js'
import { registerDirectives } from './directives/index.js'
import { INSTANCE_VARS_SYMBOL } from './types.js'

export type BootstrapConfig = {
  app: App
  instanceVars: InstanceConfig['site']
  i18n?: I18nConfig
}

export const bootstrapRoutes = (router: Router, { manager }: StoreContext, cb?: ()=> void) => {
  const metaStore = useStore('meta', manager)

  watch(() => metaStore.descriptions, (descriptions) => {
    Object.values(descriptions).forEach((description) => {
      if( description.hidden ) {
        return
      }

      const routeName = `/dashboard/${description.$id}`
      if( router.hasRoute(routeName) ) {
        return
      }

      const route = {
        name: routeName,
        path: description.$id,
        redirect: `/dashboard/c/${description.$id}`,
        meta: {
          title: description.$id,
          icon: description.icon,
          collection: description.$id,
        },
      }

      router.addRoute('/dashboard', route)

      if( cb ) {
        cb()
      }
    })

  }, {
    immediate: true,
  })
}

export const bootstrapApp = (config: BootstrapConfig) => {
  const { app } = config
  const globalStateManager = createGlobalStateManager()
  const i18n = createI18n()

  app.use(globalStateManager)
  app.use(i18n, config.i18n)
  registerDirectives(app)

  const context: StoreContext = {
    i18n,
    manager: globalStateManager,
  }

  const metaStore = meta(context)
  const userStore = user(context)

  app.provide(INSTANCE_VARS_SYMBOL, config.instanceVars)

  return {
    context,
    i18n,
    metaStore,
    userStore,
  }
}

