import { useApp, defineOptions, registerStores } from 'aeria-ui'
import * as stores from './stores/index.js'
import Main from './main.vue'

import '../../packages/ui/dist/ui.css'
import './style/main.css'
import './style/main.less'

const options = defineOptions({
  component: Main,
  setup: ({ context }) => {
    registerStores(stores, context)
  },
})

useApp(options).then(({ mount }) => {
  mount()
})

