import type { App } from 'vue'

import { overlay } from './v-overlay.js'
import { loading } from './v-loading.js'
import { clickable } from './v-clickable.js'
import { focus } from './v-focus.js'
import { theme } from './v-theme.js'

export const registerDirectives = (app: App) => {
  app.directive('overlay', overlay)
  app.directive('loading', loading)
  app.directive('clickable', clickable)
  app.directive('focus', focus)
  app.directive('theme', theme)
}
