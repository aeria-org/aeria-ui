import { parseArgs } from 'node:util'
import { serve, build } from './modes.js'

const { values: opts } = parseArgs({
  options: {
    mode: {
      type: 'string',
      short: 'm',
    },
  },
})

function main() {
  switch( opts.mode ) {
    case 'build':
      return build()

    case 'serve':
      return serve()

    default:
      throw new Error(`mode ${opts.mode} not found`)
  }
}

main()
