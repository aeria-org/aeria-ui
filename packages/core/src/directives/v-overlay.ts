import type { Directive } from 'vue'

type OverlayOptions = {
  condition: boolean
  layer?: number
  click?: (...args: unknown[])=> unknown
}

const overlay: Directive = {
  mounted: (el, binding) => {
    const value: OverlayOptions = binding.value || {}
    if( value.condition === false ) {
      return
    }

    const { layer = 50 } = value

    if( !el.parentNode ) {
      throw new Error('make sure a parent node exists when casting v-overlay')
    }

    const overlayElem = document.createElement('div')

    const visible = !binding.modifiers.invisible
      && (
        !binding.modifiers.invisibleOnLarge
          || window.matchMedia('(max-width: 600px)').matches
      )

    const style = [
      'position: fixed',
      'display: block',
      'top: 50%',
      'left: 50%',
      'transform: translate(-50%, -50%)',
      `z-index: ${layer}`,
      'width: 100vw',
      'height: 100vh',
    ]

    if( visible ) {
      style.push('background: rgba(65, 82, 105, .25)')
      style.push('backdrop-filter: blur(2px)')
    }

    overlayElem.setAttribute('style', style.join(';'))

    if( value.click ) {
      overlayElem.onclick = value.click
    }

    el.style.zIndex = `${layer + 10}`
    el.parentNode.insertBefore(overlayElem, el)
  },

  beforeUnmount: (el, binding) => {
    const value: OverlayOptions = binding.value || {}
    if( value.condition === false ) {
      return
    }

    el.previousElementSibling?.remove()
  },
}

export default overlay
