import { defineConfig, type InlineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { deepMerge } from '@aeriajs/common'
import vue from '@vitejs/plugin-vue'
import vueComponents from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import aeriaIcons from 'aeria-icons'
import { icons } from 'aeria-icons/common'
import { getInstanceConfig } from './instance.js'
import transformIndexHtml from './plugins/transform-index-html.js'
import loadYaml from './plugins/load-yaml.js'

export default defineConfig(async () => {
  const instanceConfig = await getInstanceConfig()
  const {
    vite: viteConfig = {},
    icons: iconsConfig = {},
    site: siteConfig = {},
  } = instanceConfig

  viteConfig.base ||= siteConfig.base

  const config = deepMerge(viteConfig, {
    publicDir: 'static',
    resolve: {
      alias: {
        'bson': fileURLToPath(new URL('bson.cjs', import.meta.resolve('bson'))),
      },
    },
    envPrefix: [
      'VITE_',
      'AERIA_',
    ],
    plugins: [
      aeriaIcons({
        hash: true,
        defaultStyle: iconsConfig.defaultStyle,
        safeList: iconsConfig.safeList,
        libraries: iconsConfig.libraries,
        async preEmit() {
          const userIcons = await (async () => {
            try {
              return await import(process.cwd() + '/../api/node_modules/.aeria/icons.js')
            } catch( err ) {
              return {
                icons: [],
              }
            }
          })()

          const builtinsIcons = await import('@aeriajs/builtins-icons')

          userIcons.icons.forEach((icon: string) => {
            icons.add(icon)
          })

          builtinsIcons.icons.forEach((icon: string) => {
            icons.add(icon)
          })
        },
      }),
      autoImport({
        exclude: [
          /\/node_modules\//,
          /\.git\//,
          /@?aeria-ui/,
        ],
        imports: [
          'vue',
          'vue-router',
          {
            'aeria-ui': [
              'useStore',
              'useParentStore',
              'useBreakpoints',
              'useAction',
              'useNavbar',
            ],
          },
          {
            'aeria-sdk': ['aeria'],
          },
        ],
        dts: './.aeria-ui/auto-imports.d.ts',
      }),
      vueComponents({
        dirs: [
          process.cwd() + '/components',
          process.cwd() + '/src/components',
        ],
        resolvers: [
          (componentName) => {
            if( /^Aeria[A-Z]/.test(componentName) ) {
              return {
                name: componentName,
                from: '@aeria-ui/ui',
              }
            }
          },
        ],
        dts: './.aeria-ui/components.d.ts',
      }),
      vue(),
      transformIndexHtml(instanceConfig),
      loadYaml(),
    ],
    optimizeDeps: {
      include: ['bson'],
      exclude: [
        'mongodb',
        'aeria-sdk',
      ],
    },
    build: {
      target: 'esnext',
    },
    esbuild: {
      legalComments: 'external',
    },
  } satisfies InlineConfig)

  return config
})

