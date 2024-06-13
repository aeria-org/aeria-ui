import type { Description } from '@aeriajs/types'
import type { user as originalUser } from '@aeriajs/builtins'
import { registerStore } from '@aeria-ui/state-management'
import { reactive } from 'vue'
import { createCollectionStore } from '../state/collection.js'
import { STORAGE_NAMESPACE } from '../constants.js'
import { meta } from './meta.js'
import { Result } from 'aeria-sdk'

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
          const { error, result: authResult } = await <ReturnType<typeof originalUser.functions.authenticate>>this.$functions.authenticate(payload)
          if( error ) {
            const errorMessage = error.code
            metaStore.$actions.spawnModal({
              title: 'Erro!',
              body: errorMessage,
            })

            return Result.error(error)
          }

          state.credentials = {
            email: '',
            password: '',
          }

          setCurrentUser(authResult)
          await metaStore.$actions.describe({
            roles: true,
          })

          return Result.result(authResult)

        } catch( err ) {
          signout()
          console.trace(err)
          throw err
        }
      },
    }),
  }, context)

})

