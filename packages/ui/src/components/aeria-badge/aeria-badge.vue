<script setup lang="ts">
type Props = {
  large?: boolean
  alt?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="`
    badge
    ${large && 'badge--large'}
    ${alt && 'badge--alt'}
  `"
  >
    <slot />
  </div>
</template>

<style scoped src="./aeria-badge.less"></style>
