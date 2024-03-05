<script setup lang="ts">
import type { PromptAction } from '@aeria-ui/web'
import { useStore } from '@aeria-ui/state-management'
import AeriaPanel from '../../aeria-panel/aeria-panel.vue'
import AeriaBareButton from '../../aeria-bare-button/aeria-bare-button.vue'

type Props = {
  title?: string
  actions: PromptAction[]
}

defineProps<Props>()

const metaStore = useStore('meta')

const onClick = (answer: PromptAction) => {
  metaStore.$actions.fulfillPrompt(answer)
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
        :style="`grid-template-columns: repeat(${actions.length}, 1fr)`"
      >
        <aeria-bare-button
          v-for="(action, index) in actions"
          :key="`action-${index}`"

          :class="`
            prompt__action
            prompt__action--${action.variant || 'primary'}
          `"
          @click="action.click
            ? action.click(action)
            : onClick(action)
          "
        >
          {{ action.title || action.name }}
        </aeria-bare-button>
      </div>
    </template>
  </aeria-panel>
</template>

<style scoped src="./aeria-prompt.less"></style>
