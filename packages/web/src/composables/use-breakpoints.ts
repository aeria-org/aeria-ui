import { ref, computed } from 'vue'

const widthMatches = (size: string) => window.matchMedia(`(min-width: ${size})`).matches

let listenerAttached = false

export const useBreakpoints = () => {
  if( typeof window === 'undefined' ) {
    return {} as {
      width: number
      height: number
      md: number
      lg: number
      xl: number
    }
  }

  const viewport = ref({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const breakpoints = computed(() => ({
    width: viewport.value.width,
    height: viewport.value.height,
    md: widthMatches('768px'),
    lg: widthMatches('1024px'),
    xl: widthMatches('1280px'),
  }))

  if( !listenerAttached ) {
    window.addEventListener('resize', () => {
      viewport.value.width = window.innerWidth
      viewport.value.height = window.innerHeight
    })

    listenerAttached = true
  }

  return breakpoints
}

