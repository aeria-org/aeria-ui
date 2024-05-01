import path from 'path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'fs/promises'
import { DEFAULT_STYLE } from './constants.js'

export type Options = {
  safeList?: string[]
  libraries?: string[]
  preEmit?: ()=> Promise<void>
  hash?: boolean
  allIcons?: boolean
}

const makeExpressions = () => {
  const regexes = [
    /<[^>]*[^:]icon="([^"]+)"/mg,
    /icon: ?['"]([^'"]+)['"]/mg,
    /icon: ?([\w:-]+)$/mg,
  ]

  return regexes
}

export const icons = new Set<string>()

export const fileName = (iconName: string) => {
  const [style, filename] = iconName.includes(':')
    ? iconName.split(':')
    : [
      DEFAULT_STYLE,
      iconName,
    ]

  return style === 'regular'
    ? path.join(style, `${filename}.svg`)
    : path.join(style, `${filename}-${style}.svg`)
}

export const scrapper = (options: Options) => async (source: string) => {
  const shouldAdd = new Set<string>()
  const regexes = makeExpressions()

  if( options.safeList && !icons.size ) {
    options.safeList.forEach((iconName) => {
      shouldAdd.add(iconName)
    })
  }

  for( const regex of regexes ) {
    let match: string[] | null
    while( match = regex.exec(source) ) {
      const iconName = match[1]

      if( !icons.has(iconName) ) {
        shouldAdd.add(iconName)
      }
    }
  }

  for( const iconName of shouldAdd ) {
    icons.add(iconName)
  }
}

export const packTogether = async (icons: string[]) => {
  const symbols = []
  for( const iconName of icons ) {
    if( !iconName ) {
      continue
    }

    const [style, filename] = iconName.includes(':')
      ? iconName.split(':')
      : [
        DEFAULT_STYLE,
        iconName,
      ]

    try {
      const newPath = path.join(
        fileURLToPath(import.meta.resolve('@phosphor-icons/core')),
        '..',
        '..',
        'assets',
        fileName(iconName),
      )

      const content = await readFile(newPath)
      const paths = content.toString().match(/<path ([^>]+)>/g)!.join('')
      const icon = `<symbol id="${style}:${filename.replace(new RegExp(`-${style}`), '')}">${paths}</symbol>`

      symbols.push(icon)

    } catch( e ) {
      console.warn(`icon ${iconName} not found`)
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`

  return svg
}

export const makeHash = () => Date.now().toString().slice(-10)

