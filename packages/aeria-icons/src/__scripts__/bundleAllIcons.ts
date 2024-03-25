import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'node:url'
import { packTogether } from '../common.js'
import { icons, IconStyle } from '@phosphor-icons/core'

const bundlePath = fileURLToPath(await import.meta.resolve!('../../dist/icons.svg'))

const bundle = async () => {
  const iconNames = icons.reduce((a, icon) => [
    ...a,
    ...Object.values(IconStyle).map((style) => `${style}:${icon.name}`),
  ], [] as string[])

  const content = await packTogether(iconNames)
  await writeFile(bundlePath, content)
}

bundle()

