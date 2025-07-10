import type { InlineConfig } from 'vite'
import type { IconStyle } from '@phosphor-icons/core'
import { dynamicImport } from '@aeriajs/common'

export type InstanceConfig = {
  site: {
    base?: string
    title?: string
    signinText?: string
    signupForm?: boolean
    allowedRedirectionUris?: string[]
  }
  icons?: {
    defaultStyle?: IconStyle
    safeList?: string[]
    libraries?: string[]
  }
  vite?: InlineConfig
}

export const getInstanceConfig = async (): Promise<Partial<InstanceConfig>> => {
  try {
    const { default: content } = await dynamicImport(process.cwd() + '/.aeria-ui/instance.js')
    return content

  } catch( err ) {
    if( (err as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND' ) {
      return {
        site: {},
      }
    }

    throw err
  }
}

