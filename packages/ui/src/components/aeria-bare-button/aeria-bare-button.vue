<script setup lang="ts">
type Props = {
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', event: Event): void
}>()

const handleClick = (event: Event) => {
  if( !props.disabled ) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="`
      barebutton
      barebutton--${disabled ? 'disabled' : 'enabled'}
    `"
    @click.prevent="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped src="./aeria-bare-button.less"></style>
