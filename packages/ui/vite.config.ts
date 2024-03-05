import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true
    }),
    viteStaticCopy({
      targets: [
        {
          src: './src/less',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'aeria-ui',
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
        'maska',
        /@aeria-ui\//,
        /@aeriajs\//,
      ]
    }
  },
})
