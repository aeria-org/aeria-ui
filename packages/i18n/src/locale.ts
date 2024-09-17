import { getValueFromPath } from '@aeriajs/common'
import { reactive, inject, type Plugin } from 'vue'

export type LocaleMessages = {
  [P in string]: string | [string, string] | LocaleMessages
}

export type Locales = Record<string, LocaleMessages | LocaleMessages[] | undefined>

export type I18nConfig = {
  current: string
  locales: Locales
}

export type TextOptions = {
  plural?: boolean
  capitalize?: boolean
  noFallback?: boolean
  context?: string
}

export type GlobalI18n = {
  __globalI18n: I18nConfig
}

export const I18N_KEY = Symbol('i18n')

export const createI18n = () => {
  const i18n = reactive<I18nConfig>({
    current: '',
    locales: {},
  })

  return {
    __globalI18n: i18n,
    install(app, options?: I18nConfig) {
      if( options ) {
        Object.assign(i18n, options)
      }

      app.provide(I18N_KEY, i18n)
    },
  } satisfies GlobalI18n & Plugin
}

export const useI18n = () => {
  const config = inject(I18N_KEY, {} as I18nConfig)
  return {
    config,
    t: (text: string, options: TextOptions = {}) => {
      return t(text, options, config)
    },
  }
}

export const getI18nConfig = (i18n: ReturnType<typeof useI18n>) => {
  return i18n.config
}

export const setLocale = (current: string, config?: I18nConfig) => {
  const i18n = config || getI18nConfig(useI18n())
  i18n.current = current
}

export const getLocale = (config?: I18nConfig) => {
  const i18n = config || getI18nConfig(useI18n())
  return i18n.current
}

const capitalize = (text: string) => {
  return text[0].toUpperCase() + text.slice(1)
}

export const internalTranslate = (originalText: string, _options: TextOptions = {}, config?: I18nConfig): string => {
  const i18n = config || getI18nConfig(useI18n())
  const localeMemo = i18n
  if( !originalText ) {
    return ''
  }

  const text = originalText[0].toLowerCase() + originalText.slice(1)
  const options = Object.assign({}, _options)
  options.capitalize ??= originalText[0] === originalText[0].toUpperCase()

  if( !options.context ) {
    if( text.endsWith('s') ) {
      const offset = text.endsWith('ses')
        ? -2
        : -1

      const result = internalTranslate(text.slice(0, offset), Object.assign({
        plural: true,
        noFallback: true,
      }, options), i18n)

      if( result ) {
        return result
      }
    }

    if( ~text.indexOf('_') ) {
      const camelCased = text.replace(/_(\w)/, (r) => r[1].toUpperCase())
      const result = internalTranslate(camelCased, Object.assign({
        noFallback: true,
      }, options), i18n)

      if( result ) {
        return result
      }
    }
  }

  const locale = localeMemo.locales[localeMemo.current]
  if( !locale ) {
    return text
  }

  const fullPath = (text: string) => options.context
    ? `${options.context}.${text}`
    : text

  let result: string | object | undefined
  if( Array.isArray(locale) ) {
    const matchedLocale = locale.find((candidate) => getValueFromPath(candidate, fullPath(text)))
    result = matchedLocale
      ? getValueFromPath(matchedLocale, fullPath(text))
      : undefined
  } else {
    result = getValueFromPath(locale, fullPath(text))
  }

  if( !result ) {
    if( options.noFallback ) {
      return ''
    }

    const fallback = /([ ]|(\.$))/.test(text)
      ? text
      : text.split('.').pop()!

    return options.capitalize
      ? capitalize(fallback)
      : fallback
  }

  const resultText = typeof result === 'string' || Array.isArray(result)
    ? result
    : '$' in result
      ? result.$ as string
      : text

  const parts = Array.isArray(resultText)
    ? resultText
    : resultText.split('|').map((part) => part.trim())

  const translated: string = options.plural && parts.length > 1
    ? parts[1]
    : parts[0]

  return options.capitalize
    ? capitalize(translated)
    : translated
}

export const t = (text: string, options: TextOptions = {}, i18n?: I18nConfig) => {
  if( !text ) {
    return ''
  }

  const result = internalTranslate(text, options, i18n)
  return result
}

