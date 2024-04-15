import type { Directive } from 'vue'

const clickable: Directive = {
  mounted: (el, binding) => {
    if( window.matchMedia('(min-width: 600px)').matches ) {
      const cursor = binding.value?.blocked
        ? 'not-allowed'
        : 'pointer'

      el.style.cursor = cursor
      el.style['user-select'] = 'none'
    }
  },
}

export default clickable
