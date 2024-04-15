import { ref, watch, type Ref } from 'vue'

type ScrollObserverOptions = {
  antecipate: number
}

export const useScrollObserver = (element?: Ref<HTMLElement | null> | null, options?: ScrollObserverOptions) => {
  const { antecipate = 0 } = options || {}

  const reachedEnd = ref(true)
  const updateScroll = () => {
    const targetEl = element!.value
    reachedEnd.value = targetEl
      ? targetEl.scrollTop + targetEl.offsetHeight >= targetEl.scrollHeight - antecipate
      : true
  }

  const windowScroll = () => {
    reachedEnd.value = window.innerHeight + window.scrollY >= document.body.offsetHeight - antecipate
  }

  if( element ) {
    watch(element, (el) => {
      if( el ) {
        const ob = new ResizeObserver(updateScroll)
        ob.observe(el)

        el.addEventListener('scroll', () => {
          updateScroll()
        })
      }

    }, {
      immediate: true,
    })
  } else {
    window.addEventListener('scroll', windowScroll)
  }

  return {
    reachedEnd,
    detach: () => {
      window.removeEventListener('scroll', windowScroll)
    },
  }
}
