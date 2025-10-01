import type { Description, RolesHierarchy } from '@aeriajs/types'
import type { user as originalUser, file } from '@aeriajs/builtins'
import { reactive } from 'vue'
import { Result } from '@aeriajs/types'
import { deepClone } from '@aeriajs/common'
import { createStore, useStore } from '@aeria-ui/state-management'
import { createCollectionStore } from '../state/collection.js'
import { STORAGE_NAMESPACE } from '../constants.js'
import { meta } from './meta.js'
import { type IndividualActionPayload } from '../composables/use-action.js'

export type User = {
  _id: string
  name: string
  roles: string[]
  password?: string
  picture_file?: typeof file.item & {
    _id: string
  }
}

export type SuccessfulAuthentication = {
  token: {
    type: 'bearer'
    content: string
  }
  user: User
}

export type Credentials = {
  email: string
  password: string
}

const freshUser = {
  _id: '',
  name: '',
  roles: [],
} satisfies User

export const user = createStore((context) => {
  const state = reactive({
    item: deepClone<User>(freshUser),
    currentUser: freshUser as User,
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

  if( typeof localStorage !== 'undefined' ) {
    const auth = localStorage.getItem(`${STORAGE_NAMESPACE}:auth`)
    if( auth ) {
      setCurrentUser(JSON.parse(auth))
    }
  }

  function setCurrentUser(auth: SuccessfulAuthentication | null) {
    for( const key in state.currentUser ) {
      switch( key ) {
        case 'roles':
          state.currentUser[key] = []
          continue
      }
      delete state.currentUser[key as keyof typeof state.currentUser]
    }

    Object.assign(state.currentUser, freshUser)
    Object.assign(state.currentUser, auth ? auth.user : freshUser)

    if( typeof localStorage !== 'undefined' ) {
      if( auth ) {
        localStorage.setItem(`${STORAGE_NAMESPACE}:auth`, JSON.stringify(auth))
      } else {
        localStorage.removeItem(`${STORAGE_NAMESPACE}:auth`)
      }
    }
  }

  function signout() {
    if( typeof localStorage !== 'undefined' ) {
      localStorage.removeItem(`${STORAGE_NAMESPACE}:auth`)
    }
    setCurrentUser(null)
  }

  return createCollectionStore({
    $id: 'user',
    state,
    getters: (state) => ({
      properties: () => {
        const metaStore = meta(context)
        const properties = state.description.properties

        if( metaStore.rolesHierarchy ) {
          properties.roles.items.enum = metaStore.roles.filter((role) => {
            for( const userRole of state.currentUser.roles ) {
              if( state.item.roles.includes(role) ) {
                return true
              }

              const hierarchy = metaStore.rolesHierarchy![userRole as keyof typeof metaStore.rolesHierarchy] as RolesHierarchy[keyof RolesHierarchy]
              if( hierarchy ) {
                if( hierarchy === true ) {
                  return true
                }

                return hierarchy.includes(role)
              }
            }
            return false
          })

        } else {
          properties.roles.items.enum = metaStore.roles
        }
        return properties
      },
      signedIn: () => !!state.currentUser.roles.length,
    }),
    actions: (state) => ({
      setCurrentUser,
      signout,
      async authenticate(payload: Credentials | { revalidate: true }) {
        const store = useStore('user', context.manager)
        const metaStore = meta(context)

        try {
          const { error, result: authResult } = await (store.$functions.authenticate(payload) as ReturnType<typeof originalUser.functions.authenticate>)
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

          setCurrentUser(authResult as unknown as SuccessfulAuthentication)
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
      async copyRedefinePasswordLink({ filters }: IndividualActionPayload<{ _id: string }>) {
        const store = useStore('user', context.manager)
        const metaStore = meta(context)

        const { error, result } = await (store.$functions.getRedefinePasswordLink({
          userId: filters._id,
        }) as ReturnType<typeof originalUser.functions.getRedefinePasswordLink>)

        if( error ) {
          return metaStore.$actions.spawnToast({
            text: `Request failed: ${error.httpStatus}\n code: ${error.code}`,
            icon: 'warning',
          })
        }

        await navigator.clipboard.writeText(result.url)
        return metaStore.$actions.spawnToast({
          text: 'Link copiado',
          icon: 'info',
        })
      },
      async copyActivationLink({ filters }: IndividualActionPayload<{ _id: string }>) {
        const store = useStore('user', context.manager)
        const metaStore = meta(context)

        const { error, result } = await (store.$functions.getActivationLink({
          userId: filters._id,
        }) as ReturnType<typeof originalUser.functions.getActivationLink>)

        if( error ) {
          return metaStore.$actions.spawnToast({
            text: `Request failed: ${error.httpStatus}\n code: ${error.code}`,
            icon: 'warning',
          })
        }

        await navigator.clipboard.writeText(result.url)
        return metaStore.$actions.spawnToast({
          text: 'Link copiado',
          icon: 'info',
        })
      },
    }),
  }, context)

})

