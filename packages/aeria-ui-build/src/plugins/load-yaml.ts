import { load } from 'js-yaml'
import type { Plugin } from 'vite'
import { PLUGIN_PREFIX } from '../constants.js'

export default (): Plugin => {
  return {
    name: `${PLUGIN_PREFIX}:load-yaml`,
    transform(code, id) {
      if( !/ya?ml/.test(id) ) {
        return null
      }

      const data = load(code)
      return {
        code: `const data = ${JSON.stringify(data)};\nexport default data;`,
        map: null,
      }
    },
  }
}
