import type { Description } from '@aeriajs/types'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import type { Router } from 'vue-router'
import { watch } from 'vue'
import { arraysIntersects } from '@aeriajs/common'
import { useStore } from '@aeria-ui/state-management'

export const bootstrapRoutes = (router: Router, manager: GlobalStateManager) => {
  const metaStore = useStore('meta', manager)
  const userStore = useStore('user', manager)

  watch(() => metaStore.descriptions, (descriptions: Record<string, Description>) => {
    Object.values(descriptions).forEach((description) => {
      const routeVisibility = description.route
      if(
        Array.isArray(routeVisibility)
          && !arraysIntersects(userStore.currentUser.roles, routeVisibility)
      ) {
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
        },
      }

      router.addRoute('/dashboard', route)
    })

  }, {
    immediate: true,
  })
}
