<script setup lang="ts">
type Props = {
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', event: any): void
}>()

const onClick = (event: any) => {
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
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped src="./aeria-bare-button.less"></style>
