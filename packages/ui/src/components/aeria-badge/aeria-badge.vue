<script setup lang="ts">
type Props = {
  large?: boolean
  alt?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="[
      'badge',
      { 'badge--large': large },
      { 'badge--alt': alt },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped src="./aeria-badge.less"></style>
