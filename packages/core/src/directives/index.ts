import type { App } from 'vue'

import Overlay from './v-overlay.js'
import Loading from './v-loading.js'
import Clickable from './v-clickable.js'
import Focus from './v-focus.js'
import Theme from './v-theme.js'

export default (app: App) => {
  app.directive('overlay', Overlay)
  app.directive('loading', Loading)
  app.directive('clickable', Clickable)
  app.directive('focus', Focus)
  app.directive('theme', Theme)
}
