<script setup lang="ts">
import type { Icon } from '@aeriajs/types'
import { inject } from 'vue'
import AeriaBareButton from '../aeria-bare-button/aeria-bare-button.vue'
import AeriaIcon from '../aeria-icon/aeria-icon.vue'

// #region props
type Size =
  | 'small'
  | 'medium'
  | 'large'

type Variant =
  | 'primary'
  | 'alt'
  | 'transparent'

type Props = {
  size?: Size
  variant?: Variant
  small?: boolean
  large?: boolean
  icon?: Icon
  disabled?: boolean
  loading?: boolean
}
// #endregion props

const props = defineProps<Props>()

const variant = inject('buttonVariant', props.variant) || 'primary'
const size = (() => {
  switch( true ) {
    case props.small: return 'small'
    case props.large: return 'large'
  }

  return inject('buttonSize', props.size) || 'medium'
})()
</script>

<template>
  <aeria-bare-button
    :class="[
      'button',
      `button--${variant}`,
      `button--${size}`,
      { 'button--loading': loading },
    ]"
    :disabled="disabled || loading"
  >
    <aeria-icon
      v-if="icon"
      :icon="icon"
    >
      <div class="button__content">
        <slot />
      </div>
    </aeria-icon>

    <div
      v-else
      class="button__content"
    >
      <slot />
    </div>
  </aeria-bare-button>
</template>

<style scoped src="./aeria-button.less"></style>
