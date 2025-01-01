<script setup lang="ts">
import type { InstanceConfig } from '@aeria-ui/cli'
import type { IconStyle } from '@phosphor-icons/core'
import type { Icon } from '@aeriajs/types'
import { INSTANCE_VARS_SYMBOL } from '@aeria-ui/core'
import { inject, computed } from 'vue'

type Props = {
  icon?:
    | Icon
    | `${IconStyle}:${Icon}`
  size?: string
  fill?: string
  medium?: boolean
  reactive?: boolean
  iconRight?: boolean
  active?: boolean
}

const props = defineProps<Props>()
const instanceVars = inject<InstanceConfig['site']>(INSTANCE_VARS_SYMBOL, {})

const reactive = typeof props.reactive === 'boolean'
  ? props.reactive
  : inject('iconReactive', false)

const computedIcon = computed(() => {
  return props.icon?.includes(':')
    ? props.icon
    : `regular:${props.icon as Icon}`
})
</script>

<template>
  <a
    :class="[
      'icon',
      { 'icon--reactive': reactive },
      { 'icon--active': active },
      $slots.default ? 'icon--centered' : 'icon--standalone'
    ]"
  >
    <div
      :class="[
        'icon__icon',
        { 'icon__icon--${size}': !!size },
        { 'icon__icon--right': iconRight },
      ]"
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
        <use :href="`${instanceVars.base || '/'}assets/icons.svg#${computedIcon}`" />
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
