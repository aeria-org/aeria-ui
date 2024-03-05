import { createApp } from 'vue'
import { animal as registerAnimalStore } from './stores'
import Main from './main.vue'

registerAnimalStore()

const app = createApp(Main)
app.mount('#app')
