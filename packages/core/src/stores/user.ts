import type { Description } from '@aeriajs/types'
import { registerStore } from '@aeria-ui/state-management'
import { isError, error } from '@aeriajs/common'
import { reactive } from 'vue'
import { createCollectionStore } from '../state/collection.js'
import { STORAGE_NAMESPACE } from '../constants.js'
import { meta } from './meta.js'

type User = {
  _id: string
  name: string
  roles: string[]
}

type AuthResult = {
  token: {  
    type: 'bearer'
    content: string
  }
  user: User
}

type Credentials = {
  email: string
  password: string
}

export const user = registerStore((context) => {
  const state = reactive({
    currentUser: {} as Partial<User>,
    credentials: {
      email: '',
      password: '',
    },
    description: {} as Omit<Description, 'properties'> & {
      properties: {
        roles: {
          items: {
            enum: string[]
          }
        }
      }
    },
  })

  const auth = localStorage.getItem(`${STORAGE_NAMESPACE}:auth`)
  if( auth ) {
    setCurrentUser(JSON.parse(auth))
  }

  function setCurrentUser(auth: AuthResult | {}) {
    for( const key in state.currentUser ) {
      delete state.currentUser[key as keyof typeof state.currentUser]
    }

    if( 'user' in auth ) {
      Object.assign(state.currentUser, auth.user)
    }

    localStorage.setItem(`${STORAGE_NAMESPACE}:auth`, JSON.stringify(auth))
  }

  function signout() {
    localStorage.removeItem(`${STORAGE_NAMESPACE}:auth`)
    setCurrentUser({})
  }

  return createCollectionStore({
    $id: 'user',
    state,
    getters: (state) => ({
      properties: () => {
        const metaStore = meta(context)
        const properties = state.description.properties

        properties.roles.items.enum = metaStore.roles
        return properties
      },
      signedIn: () => !!state.currentUser.roles?.length,
    }),
    actions: (state) => ({
      setCurrentUser,
      signout,

      async authenticate(this: any, payload: Credentials | { revalidate: true }) {
        const metaStore = meta(context)

        try {
          const result = await this.$functions.authenticate(payload)
          if( isError(result) ) {
            const errorMessage = result.value.code
            metaStore.$actions.spawnModal({
              title: 'Erro!',
              body: errorMessage,
            })

            return result
          }

          const auth: AuthResult = result

          state.credentials = {
            email: '',
            password: '',
          }

          setCurrentUser(auth)
          await metaStore.$actions.describe({
            roles: true,
          })

          return 'ok'

        } catch( err ) {
          signout()
          console.trace(err)

          return error({
            code: 'TRY_CATCH_ERROR',
            message: String(err),
          })
        }
      },
    }),
  }, context)

})

