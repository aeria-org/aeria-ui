declare module 'vue' {
  import type { TemplateFunctions } from '@aeria-ui/core'

  interface ComponentCustomProperties {
    formatDateTime: TemplateFunctions['formatDateTime']
    getRelativeTimeFromNow: TemplateFunctions['getRelativeTimeFromNow']
    hasRoles: TemplateFunctions['hasRoles']
    t: TemplateFunctions['t']
    viewTitle: string
    viewIcon: string
    instanceVars: typeof import('@aeria-ui/cli').InstanceConfig['site']
    currentUser: (Collections['user']['item'] extends infer UserCollection
      ? UserCollection extends (...args: unknown[]) => unknown
        ? ReturnType<UserCollection>
        : UserCollection
      : never
    ) extends infer Coll
      ? Coll['item']
      : never
    t: typeof import('@aeria-ui/i18n').t
  }
}

export {}
