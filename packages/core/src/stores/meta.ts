import type { Description, Icon } from '@aeriajs/types'
import type { PromptOption } from '../behavior/index.js'
import type { builtinFunctions } from '@aeriajs/builtins'
import type { ExtractResult } from '@aeriajs/types/dist/result.js'
import { Result } from '@aeriajs/types'
import { deepClone, deserialize } from '@aeriajs/common'
import { reactive } from 'vue'
import { useStore, hasStore, registerStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import { createCollectionStore } from '../state/collection.js'
import { freshItem, freshFilters } from '../state/helpers.js'
import { API_URL, STORAGE_NAMESPACE } from '../constants.js'
import { request } from '../http.js'
import { user } from './user.js'

type PromptAnswer = {
  name: string
  action: PromptOption
}

const DEFAULT_THEME = 'default'

export type Toast = {
  text: string
  icon?: Icon
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
    theme: typeof localStorage !== 'undefined'
      ? localStorage.getItem(`${STORAGE_NAMESPACE}:meta:theme`) || DEFAULT_THEME
      : DEFAULT_THEME,
    themeOverride: '',
    view: {
      title: '',
      layout: 'tabular',
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
      options: {} as Record<string, PromptOption>,
    },
    toasts: [] as Toast[],
  }

  const state = reactive(deepClone(freshState))

  return {
    $id: 'meta',
    state,
    actions: {
      async describe(props?: Parameters<typeof builtinFunctions.describe>[0]) {
        state.isLoading = true
        const { data: response } = await request<Result.Error<unknown> | string>(`${API_URL}/describe`, props)

        if( typeof response !== 'string' ) {
          return Result.error(response)
        }

        const deserialized = deserialize<ExtractResult<Awaited<ReturnType<typeof builtinFunctions.describe>>>>(response)
        const globalDescriptions = state.descriptions = deserialized.descriptions

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
        return Result.result(response)
      },

      async ask(props: {
        action: (params: unknown)=> unknown,
        params?: unknown
        title?: string
        body?: string
      }) {
        const answer = await useStore('meta', context.manager).$actions.spawnPrompt({
          body: props.body || t('prompt.default', {}, context.i18n),
          options: {
            cancel: {
              title: t('action.cancel', {}, context.i18n),
              variant: 'danger',
            },
            confirm: {
              title: t('action.confirm', {}, context.i18n),
            },
          },
        })

        if( answer.name === 'confirm' ) {
          const { action, params } = props
          return action(params)
        }
      },

      spawnPrompt(props: {
        title?: string
        body?: string
        options: Record<string, PromptOption>
      }): Promise<PromptAnswer> {
        Object.assign(state.prompt, {
          ...props,
          visible: true,
        })

        return new Promise((resolve) => {
          const event = ({ detail }: CustomEvent<{ option: PromptAnswer }>) => {
            window.removeEventListener('__prompt', event as EventListener)
            state.prompt.visible = false
            resolve(detail.option)
          }

          window.addEventListener('__prompt', event as EventListener)
        })
      },

      fulfillPrompt(answer: string, action: PromptOption) {
        window.dispatchEvent(new CustomEvent('__prompt', {
          detail: {
            option: {
              name: answer,
              action,
            },
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

      spawnToast(props: {
        text: string
        icon?: Icon
      }) {
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

      popToast(itr?: number) {
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

        if( typeof localStorage !== 'undefined' ) {
          localStorage.setItem(`${STORAGE_NAMESPACE}:meta:theme`, state.theme)
        }
      },
    },
  }

})

