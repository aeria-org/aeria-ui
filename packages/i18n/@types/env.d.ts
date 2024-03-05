import type { LocaleConfig } from '../src'

declare global {
  var I18N: Record<string, LocaleConfig>
}
