import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: {
      'bson': fileURLToPath(new URL('bson.cjs', import.meta.resolve('bson'))),
    }
  },
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'aeria-app-layout',
      formats: [
        'es'
      ]
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.ts')
      },
      output: {
        exports: 'named'
      },
      external: [
        'vue',
        'vue-router',
        /@aeria-ui\//,
        /@aeriajs\//,
      ]
    },
  },
  optimizeDeps: {
    include: [
      'bson',
      '@aeriajs/types',
      '@aeriajs/common'
    ],
    exclude: [
      'vue-router'
    ]
  },
})
