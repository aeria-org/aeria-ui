import { getValueFromPath } from '@aeriajs/common'
import { reactive, inject, type Plugin } from 'vue'

export type LocaleMessages = {
  [P in string]:
    | string
    | [string, string]
    | LocaleMessages
    | undefined
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

export const I18N_KEY = Symbol.for('i18n')

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

      app.provide<GlobalI18n>(I18N_KEY, {
        __globalI18n: i18n,
      })
    },
  } satisfies GlobalI18n & Plugin
}

export const useI18n = () => {
  const instance = inject<GlobalI18n>(I18N_KEY)
  return {
    instance,
    t: (text: string, options: TextOptions = {}) => {
      return t(text, options, instance)
    },
  }
}

export const getI18nConfig = (i18n: ReturnType<typeof useI18n>) => {
  return i18n.instance
}

export const setLocale = (current: string, instance?: GlobalI18n) => {
  const i18n = instance || getI18nConfig(useI18n())
  if( i18n ) {
    i18n.__globalI18n.current = current
  }
}

export const getLocale = (instance?: GlobalI18n) => {
  const i18n = instance || getI18nConfig(useI18n())
  if( i18n ) {
    return i18n.__globalI18n.current
  }
}

const capitalize = (text: string) => {
  return text[0].toUpperCase() + text.slice(1)
}

export const internalTranslate = (originalText: string, _options: TextOptions = {}, instance?: GlobalI18n): string => {
  const i18n = instance || getI18nConfig(useI18n())
  if( !i18n ) {
    throw new Error()
  }

  const localeMemo = i18n.__globalI18n
  if( !originalText ) {
    return ''
  }

  const text = originalText[0].toLowerCase() + originalText.slice(1)
  const options = Object.assign({}, _options)
  options.capitalize ??= originalText[0] === originalText[0].toUpperCase()

  if( !options.context ) {
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

export const t = (text: string, options: TextOptions = {}, i18n?: GlobalI18n) => {
  if( !text ) {
    return ''
  }

  const result = internalTranslate(text, options, i18n)
  return result
}

