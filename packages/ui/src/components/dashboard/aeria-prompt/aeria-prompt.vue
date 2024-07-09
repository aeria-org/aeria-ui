<script setup lang="ts">
import type { PromptAction } from '@aeria-ui/core'
import { useStore } from '@aeria-ui/state-management'
import AeriaPanel from '../../aeria-panel/aeria-panel.vue'
import AeriaBareButton from '../../aeria-bare-button/aeria-bare-button.vue'

type Props = {
  title?: string
  actions: Record<string, PromptAction>
}

defineProps<Props>()

const metaStore = useStore('meta')

const onClick = (answer: string, action: PromptAction) => {
  metaStore.$actions.fulfillPrompt(answer, action)
}
</script>

<template>
  <aeria-panel
    float
    fill-footer
    :close-hint="false"
    style="--panel-min-width: 32rem;"
  >
    <div class="prompt">
      <slot />
    </div>

    <template
      v-if="title"
      #title
    >
      {{ title }}
    </template>

    <template #footer>
      <div
        class="prompt__actions"
        :style="`grid-template-columns: repeat(${Object.keys(actions).length}, 1fr)`"
      >
        <aeria-bare-button
          v-for="([actionName, action], index) in Object.entries(actions)"
          :key="`action-${index}`"

          :class="`
            prompt__action
            prompt__action--${action.variant || 'primary'}
          `"
          @click="action.click
            ? action.click(actionName, action)
            : onClick(actionName, action)
          "
        >
          {{ action.title }}
        </aeria-bare-button>
      </div>
    </template>
  </aeria-panel>
</template>

<style scoped src="./aeria-prompt.less"></style>
