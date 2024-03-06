import fs from 'fs'
import path from 'path'

const DTS_FILENAME = 'aeria-ui.d.ts'

const dts = `// WARNING: this file will be overriden
declare module 'aeria-ui' {
  export * from 'aeria-ui/dist'

  type SystemStores = typeof import('@aeria-ui/web/stores')
  type UserStores = typeof import('./src/stores')

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
  import type { TemplateFunctions } from '@aeria-ui/web'

  interface ComponentCustomProperties extends TemplateFunctions {
    viewTitle: string
    viewIcon: string
    instanceConfig: typeof import('aeria-ui-build').InstanceConfig
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
//`

const install = async () => {
  const base = process.env.INIT_CWD
  const aeriaDir = path.join(base!, '.aeria-ui')

  if( !fs.existsSync(aeriaDir) ) {
    await fs.promises.mkdir(aeriaDir)
  }

  try {
    // prevent the script from installing the dts on @aeria-ui/* packages
    const { name } = require(path.join(base!, 'package.json'))
    if( name.startsWith('@aeria-ui/') ) {
      return
    }

  } catch( e ) {
    //
  }

  await fs.promises.writeFile(path.join(aeriaDir, DTS_FILENAME), dts)
}

install()

