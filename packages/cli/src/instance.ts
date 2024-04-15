import type { InlineConfig } from 'vite'
import { dynamicImport } from '@aeriajs/common'

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
      const content = await dynamicImport(process.cwd() + '/.aeria-ui/instance.js')
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

