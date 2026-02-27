import type { Directive } from 'vue'

export const focus: Directive = (el, binding) => {
  if( binding.value ) {
    el.focus()
  }
}

