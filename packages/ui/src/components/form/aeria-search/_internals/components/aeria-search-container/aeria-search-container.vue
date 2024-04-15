<script setup lang="ts">
import { ref, watch } from 'vue'
import { useScrollObserver } from '@aeria-ui/core'

type Props = {
  observeScroll?: boolean
}

type Emits = {
  (e: 'endReached', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const containerEl = ref<HTMLElement | null>(null)
const reachedEnd = props.observeScroll
  ? useScrollObserver(containerEl, {
 antecipate: 100,
}).reachedEnd
  : null

if( reachedEnd !== null ) {
  watch(reachedEnd, (value) => {
    if( value ) {
      emit('endReached', value)
    }
  })
}
</script>

<template>
  <div class="container">
    <div
      v-if="$slots.default"
      ref="containerEl"
      class="container__content"
    >
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="container__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped src="./aeria-search-container.less"></style>
