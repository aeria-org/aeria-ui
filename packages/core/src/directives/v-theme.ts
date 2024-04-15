import { type Directive } from 'vue'
import { useStore, type GlobalStateManager } from '@aeria-ui/state-management'

const theme: Directive = {
  mounted(_, binding) {
    useStore('meta', <GlobalStateManager>binding.value).themeOverride = binding.arg
  },
  unmounted(_, binding) {
    useStore('meta', <GlobalStateManager>binding.value).themeOverride = ''
  },
}

export default theme
