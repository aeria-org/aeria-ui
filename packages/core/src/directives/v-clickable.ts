import type { Directive } from 'vue'

const clickable: Directive = {
  mounted: (el, binding) => {
    if( window.matchMedia('(min-width: 600px)').matches ) {
      el.style.cursor = binding.value?.blocked
        ? 'not-allowed'
        : 'pointer'
    }
  },
}

export default clickable
