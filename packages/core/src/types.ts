import type { t } from '@aeria-ui/i18n'

export const INSTANCE_VARS_SYMBOL = Symbol('InstanceVars')
export const MENU_SCHEMA_SYMBOL = Symbol('MenuSchema')

export type WithId<TDocument> = TDocument & {
  _id: string
}

export type RouteTitleConfig = string | ((options: {
  collectionName: string
  t: typeof t
}) => string | Promise<string>)

