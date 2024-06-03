import type { Directive } from 'vue'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import { useStore } from '@aeria-ui/state-management'

const theme: Directive = {
  mounted(_, binding) {
    useStore('meta', <GlobalStateManager>binding.value).themeOverride = binding.arg
  },
  unmounted(_, binding) {
    useStore('meta', <GlobalStateManager>binding.value).themeOverride = ''
  },
}

export default theme
