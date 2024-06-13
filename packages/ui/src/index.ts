export * from './components/index.js'
export * from './routes.js'

import { useStore } from '@aeria-ui/state-management'

const userStore = useStore('user')
userStore.$actions.xx

