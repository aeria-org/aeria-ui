import type { Directive } from 'vue'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import { useStore } from '@aeria-ui/state-management'

const theme: Directive = {
  mounted(_, binding) {
    if( binding.arg ) {
      const metaStore = useStore('meta', <GlobalStateManager>binding.value)
      metaStore.themeOverride = binding.arg!
    }
  },
  unmounted(_, binding) {
    const metaStore = useStore('meta', <GlobalStateManager>binding.value)
    metaStore.themeOverride = ''
  },
}

export default theme
