<script setup lang="ts">
import { ref } from 'vue'
import { useBreakpoints } from '@aeria-ui/web'

type Props = {
  where?:
    'top'
    | 'topleft'
    | 'left'
    | 'bottom'
    | 'right'
}

const props = defineProps<Props>()
const breakpoints = useBreakpoints()

const visible = ref(false)
const where = props.where || 'top'
</script>

<template>
  <div
    v-if="breakpoints.md"
    class="info"
    @mouseleave="visible = false
    "
  >
    <div
      v-if="visible"
      :class="`
        info__bubble
        info__bubble--${where}
    `"
    >
      <div class="info__content">
        <slot name="text" />
      </div>
    </div>
    <div @mouseover="visible = true">
      <slot />
    </div>
  </div>

  <slot v-else />
</template>

<style scoped src="./aeria-info.less"></style>
