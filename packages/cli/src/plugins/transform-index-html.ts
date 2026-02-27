import ejs from 'ejs'
import type { Plugin } from 'vite'
import type { getInstanceConfig } from '../instance.js'
import { PLUGIN_PREFIX } from '../constants.js'

export const transformIndexHtml = (instanceConfig: Awaited<ReturnType<typeof getInstanceConfig>>): Plugin => {
  return {
    name: `${PLUGIN_PREFIX}:transform-index-html`,
    transformIndexHtml(html) {
      return ejs.render(html, {
        instanceConfig,
      })
    },
  }
}
