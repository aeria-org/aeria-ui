<script setup lang="ts">
import type { Icon } from '@aeriajs/types'
import type { IconStyle } from '@phosphor-icons/core'
import { inject, computed } from 'vue'

type Props = {
  icon?: Icon
  size?: string
  medium?: boolean
  reactive?: boolean | null
  iconRight?: boolean
  fill?: string
}

const props = defineProps<Props>()

const reactive = typeof props.reactive === 'boolean'
  ? props.reactive
  : inject('iconReactive', false)

const computedIcon = computed((): Icon => {
  return props.icon?.includes(':')
    ? props.icon
    : `regular:${<Exclude<Icon, `${IconStyle}:${string}`>>props.icon}`
})
</script>

<template>
  <a
    :class="`
      icon
      ${reactive && 'icon--reactive'}
      ${
      $slots.default
        ? 'icon--centered'
        : 'icon--standalone'
    }
  `"
  >
    <div
      :class="`
      icon__icon
      ${ size && `icon__icon--${size}` }
      ${ iconRight && 'icon__icon--right' }
    `"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 256 256"
        data-component="icon"
        v-bind="{
          ...(fill ? { fill } : {})
        }"
      >
        <use :href="`/assets/icons.svg#${computedIcon}`" />
      </svg>
    </div>
    <div
      v-if="$slots.default"
      data-component="icon-label"
    >
      <slot />
    </div>
  </a>
</template>

<style scoped src="./aeria-icon.less"></style>
