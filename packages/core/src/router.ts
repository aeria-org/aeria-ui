import type { Icon } from '@aeriajs/types'
import type { StoreContext } from '@aeria-ui/state-management'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { meta } from './stores/index.js'

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

  router.beforeEach(async (to, from) => {
    const metaStore = meta(context)
    metaStore.menu.visible = false
    metaStore.view.title = to.meta.title as string

    window.scrollTo(0, 0)

    if( router.options.history.state.forward === from.fullPath ) {
      to.query._popstate = 'true'
    }
  })

  return router
}

