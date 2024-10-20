export const INSTANCE_VARS_SYMBOL = Symbol('InstanceVars')
export const MENU_SCHEMA_SYMBOL = Symbol('MenuSchema')

export type WithId<TDocument> = TDocument & {
  _id: string
}

