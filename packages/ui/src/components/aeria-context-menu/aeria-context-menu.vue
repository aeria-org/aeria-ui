<script setup lang="ts">
import type { CollectionAction } from '@aeriajs/types'
import { ref, computed } from 'vue'
import { useStore } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'
import AeriaBareButton from '../aeria-bare-button/aeria-bare-button.vue'
import AeriaPanel from '../aeria-panel/aeria-panel.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

type Props = {
  actions?: (CollectionAction<any> & {
    action: string
    click: (...args: any[])=> void
  })[]
  subject?: any
  overlayLayer?: number
}

type Action = {
  click: (subject: any)=> void
}

type Emits = {
  (e: 'actionClick', event: { action: Action, subject: any }): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()

const contextmenu = ref<HTMLDivElement | null>(null)
const contextmenuVisible = ref(false)

const filterActions = (actions: Props['actions']) => {
  return actions?.filter((action: any) => {
    if( action.roles ) {
      const userStore = useStore('user')
      return action.roles.include(userStore.currentUser.role)
    }

    return !!action.click
  })
}

const onClick = (action: Action, subject: any) => {
  action.click(subject)
  emit('actionClick', {
 action,
subject,
})

  contextmenuVisible.value = false
}

const position = computed(() => {
  if( !contextmenu.value ) {
    return {
      x: 0,
      y: 0,
    }
  }
  const rectTop = contextmenu.value.getBoundingClientRect().top
  const rectLeft = contextmenu.value.getBoundingClientRect().left
  const offsetY = contextmenu.value.offsetHeight

  return {
    _: contextmenuVisible.value,
    x: Math.floor(rectLeft) + 'px',
    y: Math.floor(rectTop + offsetY) + 'px',
  }
})
</script>

<template>
  <div
    v-if="Object.keys($slots).some((key) => key !== 'default') || (actions !== undefined && actions.length > 0)"
    ref="contextmenu"
    class="contextmenu"
  >
    <a
      class="contextmenu__trigger"
      @click="contextmenuVisible = true"
    >
      <slot />
    </a>
  </div>

  <teleport
    v-if="contextmenuVisible"
    to="main"
  >
    <aeria-panel
      v-model="contextmenuVisible"
      v-overlay.invisibleOnLarge="{
        layer: overlayLayer,
        click: () => {
          contextmenuVisible = false
        }
      }"
      fill
      class="content"
    >
      <div class="content__body">
        <div
          v-if="$slots.header"
          class="content__section"
        >
          <slot name="header" />
        </div>

        <div
          v-if="Object.keys($slots).filter((key) => !['default', 'extra', 'header'].includes(key)).length > 0"
          class="content__section"
          @click="contextmenuVisible = false"
        >
          <aeria-bare-button
            v-for="(slotName, sindex) in Object.keys($slots).filter((key) => !['default', 'extra', 'header'].includes(key))"
            :key="`slot-${sindex}`"
            class="
              content__item
              content__item--reactive
            "
          >
            <slot :name="slotName" />
          </aeria-bare-button>
        </div>

        <div
          v-if="actions !== undefined && actions.length > 0"
          class="content__section"
          @click="contextmenuVisible = false"
        >
          <aeria-bare-button
            v-for="(action, aindex) in filterActions(actions)"
            :key="`action-${aindex}`"
            class="
              content__item
              content__item--reactive
            "
            @click="onClick(action, subject)"
          >
            <aeria-icon
              v-if="action.icon"
              :icon="action.icon"
            >
              {{
                action.translate
                  ? t(action.label, { capitalize: true })
                  : action.label
              }}
            </aeria-icon>
          </aeria-bare-button>
        </div>

        <div
          v-if="$slots.extra"
          class="content__section"
          @click="contextmenuVisible = false"
        >
          <div class="content__item">
            <slot
              v-if="$slots.extra"
              name="extra"
            />
          </div>
        </div>
      </div>
    </aeria-panel>
  </teleport>
</template>

<style scoped src="./aeria-context-menu.less"></style>

<style scoped>
.content :deep(.panel__content) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  border-radius: var(--theme-radius-large);
  width: 90vw;
}

@media screen and (min-width: 600px) {
  .content :deep(.panel__content) {
    top: 0;
    left: 0;
    transform:
      translateX(min(v-bind('position.x'), calc(100vw - 100%)))
      translateY(min(v-bind('position.y'), calc(100vh - 100%))) !important;
    width: auto;
  }
}
</style>

