import { useApp, defineOptions } from 'aeria-ui'
import { animal as registerAnimalStore } from './stores/index.js'
import Main from './main.vue'

import '../../packages/ui/dist/style.css'
import './style/main.css'
import './style/main.less'

const options = defineOptions({
  component: Main,
  setup: ({ context }) => {
    registerAnimalStore(context)
  }
})

useApp(options).then(({ mount }) => {
  mount()
})

