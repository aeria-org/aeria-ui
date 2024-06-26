import type { Router, RouteRecordRaw } from 'vue-router'
import type { Route, MenuSchema, MenuNode } from '../index.js'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@aeria-ui/state-management'
import { arraysIntersect } from '@aeriajs/common'

type Props = {
  schema: MenuSchema
}

const findRoute = (path: string, router: Router) => {
  const found = router.resolve({
    path,
  })

  if( found.matched.length ) {
    return {
      ...found,
      meta: <MenuNode['meta']>found.meta,
      children: [],
    }
  }
}

const getSchema = (schema: MenuSchema | Route[], router: Router) => {
  return schema.map((node) => {
    if( typeof node === 'string' ) {
      return findRoute(node, router)
    }

    return 'path' in node
      ? {
        ...node,
        ...findRoute(node.path!.toString(), router),
      }
      : node
  })
}

export const useNavbar = async (props: Props) => {
  const { schema: menuSchema = [] } = props

  console.log({
    menuSchema,
  })

  const router = useRouter()
  const metaStore = useStore('meta')
  const userStore = useStore('user')

  const getRoutes = async (node?: MenuNode) => {
    const children = node && 'children' in node
      ? node.children
      : null

    const schema = getSchema(children || menuSchema, router)
    const entries: Record<string, Route | MenuNode> = {}

    await Promise.all(Object.entries(schema).map(async ([key, node]) => {
      if( !node ) {
        return
      }

      if( Array.isArray(node) ) {
        entries[key] = {
          children: await getRoutes({
            children: node,
          }),
        }
        return
      }

      const {
        children,
        ...route

      } = node

      const roles = route.meta?.roles || ('roles' in node
        ? node.roles
        : null)

      if( roles ) {
        if( typeof roles === 'function' ) {
          if( !await roles(userStore.currentUser.roles) ) {
            return
          }

        } else if( !arraysIntersect(userStore.currentUser.roles, roles) ) {
          return
        }
      }

      if( 'collapsed' in node ) {
        entries[key] = {
          ...node,
          children: await getRoutes(node),
        }

        return
      }

      entries[key] = route as any

      if( children ) {
        entries[key].children = await getRoutes(node as MenuNode)
      }
    }))

    return Object.values(entries) as Route[]
  }

  const isCurrent = (subroute: RouteRecordRaw) => {
    const route = router.currentRoute.value

    const pathMatches = typeof subroute.redirect === 'string'
      ? subroute.redirect === route.path
      : subroute.path === (route.redirectedFrom?.path || route.path).split(/\/home$/)[0]

    return pathMatches
  }

  const routes = ref(await getRoutes())

  watch(() => metaStore.descriptions, async () => {
    routes.value = await getRoutes()
  })

  return {
    routes,
    router,
    isCurrent,
  }
}
