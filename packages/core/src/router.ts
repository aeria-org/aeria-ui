import type { Icon } from '@aeriajs/types'
import type { StoreContext } from '@aeria-ui/state-management'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import { meta, user, type SuccessfulAuthentication } from './stores/index.js'
import { STORAGE_NAMESPACE } from './constants.js'

export type RouteMeta = {
  meta: {
    title: string
    icon?: Icon
    roles?: string[]
  }
}

export type Route = RouteMeta & Omit<RouteRecordRaw, 'children'> & {
  path: string
  children?: Route[]
  components?: unknown
  badgeFunction?: string
  badgePayload?: unknown
}

export type RouterExtensionNode = Omit<Route, 'name'>[]
export type RouterExtension = Record<string, RouterExtensionNode>

export const routerInstance = (routes: RouteRecordRaw[], context: StoreContext) => {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  router.beforeEach(async (to, from, next) => {
    const metaStore = meta(context)
    const userStore = user(context)

    if( typeof localStorage !== 'undefined' ) {
      const authRaw = localStorage.getItem(`${STORAGE_NAMESPACE}:auth`)
      if( authRaw ) {
        let hasError = false

        try {
          const auth = JSON.parse(authRaw) as SuccessfulAuthentication
          const decoded = jwtDecode(auth.token.content)
          if( Date.now() >= decoded.exp! * 1000 ) {
            hasError = true
          }

        } catch( err ) {
          console.trace(err)
          hasError = true
        }

        if( hasError ) {
          const nextUri = `${location.pathname}${location.search}`
          localStorage.setItem(`${STORAGE_NAMESPACE}:auth:next`, nextUri)
          localStorage.removeItem(`${STORAGE_NAMESPACE}:auth`)
          userStore.$actions.signout()

          return next(`/user/signin?next=${nextUri}`)
        }
      }
    }

    if( /^\/dashboard(\/|$)/.test(to.path) ) {
      await metaStore.$actions.describe()
    }

    metaStore.menu.visible = false
    metaStore.view.title = typeof to.meta.title === 'string'
      ? to.meta.title
      : to.path

    if( router.options.history.state.forward === from.fullPath ) {
      to.query._popstate = 'true'
    }

    window.scrollTo(0, 0)
  })

  return router
}

