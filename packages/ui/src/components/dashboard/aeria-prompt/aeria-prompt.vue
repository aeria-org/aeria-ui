<script setup lang="ts">
import type { PromptOption } from '@aeria-ui/core'
import { useStore } from '@aeria-ui/state-management'
import AeriaPanel from '../../aeria-panel/aeria-panel.vue'
import AeriaBareButton from '../../aeria-bare-button/aeria-bare-button.vue'

type Props = {
  title?: string
  options: Record<string, PromptOption>
}

defineProps<Props>()

const metaStore = useStore('meta')

const handleClick = (answer: string, option: PromptOption) => {
  metaStore.$actions.fulfillPrompt(answer, option)
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
        class="prompt__options"
        :style="`grid-template-columns: repeat(${Object.keys(options).length}, 1fr)`"
      >
        <aeria-bare-button
          v-for="([optionName, option], index) in Object.entries(options)"
          :key="`option-${index}`"

          :class="[
            'prompt__option',
            `prompt__option--${option.variant || 'primary'}`,
          ]"
          @click="option.click
            ? option.click(optionName, option)
            : handleClick(optionName, option)
          "
        >
          {{ option.title }}
        </aeria-bare-button>
      </div>
    </template>
  </aeria-panel>
</template>

<style scoped src="./aeria-prompt.less"></style>
