declare module '@vue/runtime-core' {
  import type { TemplateFunctions } from '@aeria-ui/web'

  interface ComponentCustomProperties {
    formatDateTime: TemplateFunctions['formatDateTime']
    getRelativeTimeFromNow: TemplateFunctions['getRelativeTimeFromNow']
    hasRoles: TemplateFunctions['hasRoles']
    t: TemplateFunctions['t']
    viewTitle: string
    viewIcon: string
    instanceVars: typeof import('aeria-ui-build').InstanceConfig['site']
    currentUser: (Collections['user']['item'] extends infer UserCollection
      ? UserCollection extends (...args: any[]) => any
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
