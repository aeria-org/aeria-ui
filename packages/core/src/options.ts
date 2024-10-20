import type { App, Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { GlobalI18n, I18nConfig } from '@aeria-ui/i18n'
import type { StoreContext } from '@aeria-ui/state-management'
import type { RouteMeta } from './router.js'

export type MenuNodeBase = Partial<RouteMeta> & {
  roles?: string[] | ((role: string[])=> boolean | Promise<boolean>)
  children?: (string | MenuNode)[]
  badge?: ()=> string | number extends infer ReturnType
    ? ReturnType | Promise<ReturnType>
    : never
}

export type MenuNodeNamed = MenuNodeBase & {
  path?: string
}

export type MenuNodeCollapsible = MenuNodeBase & {
  collapsed: boolean | 'user'
  children: (string | MenuNode)[]
}

export type MenuNode =
  | MenuNodeNamed
  | MenuNodeCollapsible

export type MenuSchema = (
  | MenuNode
  | string
  | (string | MenuNode)[]
)[]

export type AppOptions = {
  component: Component
  i18n?: I18nConfig
  menuSchema?: MenuSchema
  routes?: RouteRecordRaw[]
  setup?: (config: {
    app: App
    context: StoreContext<{
      i18n: GlobalI18n
    }>
  })=> void | Promise<void>
}

export const defineOptions = <TAppOptions extends AppOptions>(options: TAppOptions | (()=> TAppOptions | Promise<TAppOptions>)) => {
  return options
}

