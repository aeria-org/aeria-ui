<script setup lang="ts">
type Props = {
  list?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    :class="[
      'grid',
      { 'grid--list': list },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped src="./aeria-grid.less"></style>
