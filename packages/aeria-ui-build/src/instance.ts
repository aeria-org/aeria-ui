import type { InlineConfig } from 'vite'

export type InstanceConfig = {
  site: {
    title?: string
    signinText?: string
    signupForm?: boolean
  }
  icons?: {
    safeList?: string[]
    libraries?: string[]
  }
  vite?: InlineConfig
}

export const getInstanceConfig = async () => {
  const config = await (async (): Promise<Partial<InstanceConfig>> => {
    try {
      const content = await import(process.cwd() + '/.aeria-ui/instance.js')
      return content.default
        ? content.default
        : content
    } catch( err ) {
      return {
        site: {},
      }
    }
  })()

  return config
}

