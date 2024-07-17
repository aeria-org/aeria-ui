import type { GlobalStateManager } from '@aeria-ui/state-management'
import type { Router } from 'vue-router'
import { watch } from 'vue'
import { useStore } from '@aeria-ui/state-management'

export const bootstrapRoutes = (router: Router, manager: GlobalStateManager, cb?: ()=> void) => {
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
