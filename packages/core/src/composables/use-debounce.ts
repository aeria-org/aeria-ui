export type DebounceConfig = {
  delay: number
  immediate?: boolean
}

export const useDebounce = (config: DebounceConfig) => <T>(fn: (...args: T[])=> unknown) => {
  let timer: ReturnType<typeof setTimeout>
  let firstCall = true

  const cancel = () => clearTimeout(timer)

  const call = (...args: T[]) => {
    if( firstCall && config.immediate ) {
      firstCall = false
      return fn(...args)
    }

    cancel()
    timer = setTimeout(() => fn(...args), config.delay)
  }

  return [
    call,
    cancel,
  ]
}
