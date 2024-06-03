import type { Description } from '@aeriajs/types'
import type { PromptAction } from '../behavior/index.js'
import { deepClone, deserialize, isError } from '@aeriajs/common'
import { reactive } from 'vue'

import { useStore, hasStore, registerStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import { createCollectionStore } from '../state/collection.js'
import { freshItem, freshFilters } from '../state/helpers.js'
import { API_URL, STORAGE_NAMESPACE } from '../constants.js'
import { request } from '../http.js'
import { user } from './user.js'

type CollectionName = string
type PromptAnswer = { name: string }

const DEFAULT_THEME = 'default'

export type Toast = {
  text: string
  icon?: string
  itr: number
  idx: number
  date: Date
}

export const meta = registerStore((context) => {
  const freshState = {
    descriptions: {} as Record<string, Description>,
    roles: [] as string[],
    isLoading: false,
    globalIsLoading: false,
    theme: localStorage.getItem(`${STORAGE_NAMESPACE}:meta:theme`) || DEFAULT_THEME,
    themeOverride: '',
    view: {
      title: '',
      layout: 'tabular',
      collection: '',
    },
    menu: {
      visible: false,
    },
    modal: {
      visible: false,
      title: '',
      body: '',
      component: '',
      details: {},
    },
    prompt: {
      visible: false,
      title: '',
      body: '',
      actions: [] as PromptAction[],
    },
    toasts: [] as Toast[],
  }

  const state = reactive(deepClone(freshState))

  return {
    $id: 'meta',
    state,
    actions: {
      async describe(props?: { revalidate?: boolean, roles?: boolean }) {
        state.isLoading = true
        const { data: response } = await request(`${API_URL}/describe`, props)
        if( isError(response) ) {
          return response
        }

        const deserialized = deserialize(response)

        const globalDescriptions: Record<CollectionName, Description> =
          state.descriptions = deserialized.descriptions

        if( deserialized.roles ) {
          state.roles = deserialized.roles
        }

        if( deserialized.auth ) {
          user(context).$actions.setCurrentUser(deserialized.auth)
        }

        for ( const [collectionName, description] of Object.entries(globalDescriptions) ) {
          const rawDescription = Object.assign({}, description)
          const item = freshItem(description)

          const filters = freshFilters(description)

          if( hasStore(collectionName, context.manager) ) {
            const store = useStore(collectionName, context.manager)
            Object.assign(store, {
              item,
              filters,
              freshItem: deepClone(item),
              freshFilters: deepClone(filters),
              rawDescription,
            })
            continue
          }

          registerStore(() => createCollectionStore({
            $id: collectionName,
            state: {
              item,
              filters,
              freshItem: deepClone(item),
              freshFilters: deepClone(filters),
              rawDescription,
            },
          }, context))(context)

        }

        state.isLoading = false
        return response
      },

      async ask(props: {
        action: (params: any)=> unknown,
        params?: any
        title?: string
        body?: string
      }) {
        const answer = await useStore('meta', context.manager).$actions.spawnPrompt({
          body: t(props.body || 'prompt.default', {}, context.i18n),
          actions: [
            {
              name: 'cancel',
              title: t('action.cancel', {}, context.i18n),
              variant: 'danger',
            },
            {
              name: 'confirm',
              title: t('action.confirm', {}, context.i18n),
            },
          ],
        })

        if( answer.name === 'confirm' ) {
          const { action, params } = props
          return action(params)
        }
      },

      spawnPrompt(props: {
        title?: string
        body?: string
        actions: PromptAction[]
      }): Promise<PromptAnswer> {
        Object.assign(state.prompt, {
          ...props,
          visible: true,
        })

        return new Promise((resolve) => {
          const event = ({ detail }: any) => {
            window.removeEventListener('__prompt', event)
            state.prompt.visible = false
            resolve(detail.option)
          }

          window.addEventListener('__prompt', event)
        })
      },

      fulfillPrompt(answer: PromptAnswer) {
        window.dispatchEvent(new CustomEvent('__prompt', {
          detail: {
            option: answer,
          },
        }))
      },

      spawnModal(props: Partial<Omit<typeof state.modal, 'visible'>>) {
        Object.assign(state.modal, freshState.modal)
        Object.assign(state.modal, {
          ...props,
          visible: true,
        })
      },

      spawnToast(
        this: any,
        props: {
          text: string
          icon?: string
        },
      ) {
        if( state.toasts.length >= 3 ) {
          state.toasts.splice(-1)
        }

        state.toasts.unshift({
          ...props,
          itr: Math.random(),
          idx: state.toasts.length,
          date: new Date(),
        })
      },

      popToast(this: { toasts: any[] }, itr?: number) {
        if( !itr ) {
          state.toasts.shift()
          return
        }

        state.toasts = state.toasts
          .filter((toast) => toast.itr !== itr)
      },

      saveTheme(theme?: string) {
        if( theme ) {
          state.theme = theme
        }

        localStorage.setItem(`${STORAGE_NAMESPACE}:meta:theme`, state.theme)
      },
    },
  }

})

