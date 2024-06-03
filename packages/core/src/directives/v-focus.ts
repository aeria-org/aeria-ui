import { Directive } from 'vue'

const focus: Directive = (el, binding) => {
  if( binding.value ) {
    el.focus()
  }
}

export default focus
