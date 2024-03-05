<script setup lang="ts">
import { type PhosphorIcon, IconStyle } from '@phosphor-icons/core'

withDefaults(defineProps<{
  name: PhosphorIcon['name']
  variant: IconStyle
}>(), {
  variant: IconStyle.REGULAR
})
</script>

<template>
  <svg
    width="64"
    height="64"
    viewBox="0 0 256 256"
  >
    <use :href="`assets/icons.svg#${variant}:${name}`"></use>
  </svg>
</template>

