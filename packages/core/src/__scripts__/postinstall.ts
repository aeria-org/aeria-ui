import * as fs from 'fs'
import * as path from 'path'

const DTS_FILENAME = 'aeria-ui.d.ts'

const dts = `// WARNING: this file will be overriden
declare module 'aeria-ui' {
  export * from 'aeria-ui/dist'

  type SystemStores = typeof import('@aeria-ui/core/stores')
  type UserStores = typeof import('../src/stores')

  type Stores = {
    [P in keyof (SystemStores & UserStores)]: ReturnType<(SystemStores & UserStores)[P]>
  }

  export const useStore: <TStoreId extends keyof Stores | keyof Collections>(
    storeId: TStoreId,
    manager?: import('@aeria-ui/state-management').GlobalStateManager
  ) => TStoreId extends keyof Stores
    ? Stores[TStoreId]
    : TStoreId extends keyof Collections
      ? 'item' extends keyof Collections[TStoreId]
        ? Collections[TStoreId]['item'] extends infer Item
          ? Item extends { _id: any }
            ? import('aeria-ui').CollectionStore<Item>
            : never
          : never
        : never
      : never
}

declare module '@vue/runtime-core' {
  import type { TemplateFunctions } from '@aeria-ui/core'

  interface ComponentCustomProperties {
    formatDateTime: TemplateFunctions['formatDateTime']
    getRelativeTimeFromNow: TemplateFunctions['getRelativeTimeFromNow']
    hasRoles: TemplateFunctions['hasRoles']
    t: TemplateFunctions['t']
    viewTitle: string
    viewIcon: string
    instanceVars: typeof import('@aeria-ui/cli').InstanceConfig['site']
    currentUser: Collections['user']['item']
    t: typeof import('@aeria-ui/i18n').t
  }
}

import type { RouteRecordRaw } from 'vue-router'
import type { Icon } from '@aeriajs/types'

declare global {
  const definePage: (page: Partial<RouteRecordRaw> & {
    meta: Record<string, unknown> & {
      title: string
      icon?: Icon
      collection?: string
    }
  }) => void
}

export {}
//`

const install = async () => {
  const base = process.env.INIT_CWD || process.cwd()
  const aeriaDir = path.join(base, '.aeria-ui')

  const { name } = JSON.parse(await fs.promises.readFile(path.join(base, 'package.json'), {
    encoding: 'utf-8',
  }))

  if( name.startsWith('@aeria-ui/') ) {
    return
  }

  if( !fs.existsSync(aeriaDir) ) {
    await fs.promises.mkdir(aeriaDir)
  }

  await fs.promises.writeFile(path.join(aeriaDir, DTS_FILENAME), dts)
}

install()

