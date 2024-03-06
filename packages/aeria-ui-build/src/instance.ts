import path from 'path'
import { readFile } from 'fs/promises'

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
  sourcemap?: boolean
  preserveSymlinks?: boolean
}

export const getInstanceConfig = async () => {
  const config = await (async (): Promise<Partial<InstanceConfig>> => {
    try {
      const content = await readFile(path.join('.aeria-ui', 'instance.json'))
      return JSON.parse(content.toString())
    } catch( e ) {
      return {}
    }
  })()

  config.site ??= {}
  return config
}
