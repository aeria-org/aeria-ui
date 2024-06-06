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
  const viteConfig = instanceConfig.vite || {}

  const { icons: iconsConfig = {} } = instanceConfig

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
        safeList: iconsConfig.safeList,
        libraries: iconsConfig.libraries,
        async preEmit() {
          const userIcons = await (async () => {
            try {
              return await import(process.cwd() + '/../api/node_modules/.aeria/icons.mjs')
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
              'useClipboard',
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
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        external: [
          'path',
          'crypto',
          '@aeriajs/builtins',
          '@aeriajs/cli',
          '@aeriajs/core',
          '@aeriajs/entrypoint',
          '@aeriajs/http',
          '@aeriajs/node-http',
          '@aeriajs/security',
          '@aeriajs/server',
        ],
        onwarn: (warning, rollupWarn) => {
          if( !warning.code || !['UNUSED_EXTERNAL_IMPORT'].includes(warning.code) ) {
            rollupWarn(warning)
          }
        },
      },
    },
  } satisfies InlineConfig)

  return config
})

