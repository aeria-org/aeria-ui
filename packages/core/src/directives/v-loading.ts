import type { Directive, DirectiveBinding } from 'vue'

const update = (el: HTMLElement, binding: DirectiveBinding) => {
  el.ariaBusy = el.getAttribute('aria-busy')

  if( !binding.value ) {
    if( el.ariaBusy ) {
      el.removeAttribute('aria-busy')
      el.removeAttribute('style')
      el.children[el.children.length - 1].remove()
    }
    return
  }

  if( el.ariaBusy ) {
    return
  }

  if( !el.parentNode ) {
    throw new Error('make sure a parent node exists when casting v-loading')
  }

  const overlayElem = document.createElement('div')

  overlayElem.setAttribute('style', [
    'position: absolute',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'display: flex',
    'justify-content: center',
    'align-items: center',
    'backdrop-filter: blur(4px)',
  ].join(';'))

  const innerElem = document.createElement('div')
  innerElem.classList.add('loading')
  innerElem.appendChild(document.createElement('div'))
  innerElem.appendChild(document.createElement('div'))

  overlayElem.appendChild(innerElem)
  el.setAttribute('style', [
    'position: relative',
    'cursor: wait',
  ].join(';'))

  el.setAttribute('aria-busy', 'true')
  el.appendChild(overlayElem)
}

export const loading: Directive = {
  mounted: update,
  updated: update,
}

