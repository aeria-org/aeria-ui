import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { MenuNode, MenuSchema } from '@aeria-ui/core'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import { useBreakpoints, useNavbar, MENU_SCHEMA_SYMBOL } from '@aeria-ui/core'
import { useStore, getGlobalStateManager } from '@aeria-ui/state-management'
import { reactive, inject, toRefs, unref, watch } from 'vue'

type NavbarRefs = {
  routes: MenuNode[]
  router: Pick<Router, 'push'>
  isCurrent: Awaited<ReturnType<typeof useNavbar>>['isCurrent']
}

export const breakpoints = useBreakpoints()

export const badgeMemo: Record<string, unknown> = {}

export const navbarRefs = reactive<NavbarRefs>({
  routes: [],
  router: {} as any,
  isCurrent: (..._args: unknown[]) => false,
})

export const {
  routes,
  isCurrent,
} = toRefs(navbarRefs)

export const memoizeBadge = async (promise: ()=> Promise<unknown> | unknown, key: string) => {
  if( key in badgeMemo ) {
    return badgeMemo[key]
  }

  const result = badgeMemo[key] = promise()
  return result
}

export const navbarEntryOpen = (node: MenuNode): boolean | undefined => {
  if( 'children' in node ) {
    return node.children!.some((child) => {
      if( typeof child === 'string' ) {
        return
      }

      if( 'path' in child ) {
        return isCurrent.value(child)
      }

      if( 'children' in child ) {
        return navbarEntryOpen(child)
      }
    })
  }
}

export const isCollapsibleRouteOpen = (node: MenuNode) => {
  if( !('collapsed' in node) ) {
    return 'children' in node
  }

  if( node.collapsed !== 'user' && navbarEntryOpen(node) ) {
    node.collapsed = false
    return true
  }

  return !node.collapsed
}

export const pushRoute = (manager: GlobalStateManager, ...args: Parameters<Router['push']>) => {
  if( !breakpoints.value.md ) {
    const metaStore = useStore('meta', manager)
    metaStore.menu.visible = false
  }

  window.scrollTo(0, 0)
  return navbarRefs.router.push(...args)
}

export const routeClick = (node: MenuNode, manager: GlobalStateManager) => {
  if( 'collapsed' in node ) {
    node.collapsed = node.collapsed
      ? false
      : 'user'
    return
  }

  pushRoute(manager, {
    path: node.path!,
  })
}

export const initTheme = () => {
  const menuSchema = inject<MenuSchema | Ref<MenuSchema>>(MENU_SCHEMA_SYMBOL, [])
  const manager = getGlobalStateManager()

  watch(() => menuSchema, async () => {
    const navbar = await useNavbar({
      schema: unref(menuSchema),
    })

    Object.assign(navbarRefs, navbar)
  }, {
    immediate: true,
  })

  return {
    manager,
    menuSchema,
  }
}

