<script setup lang="ts">
import { t } from '@aeria-ui/i18n'
import { ref } from 'vue'

type Props = {
  enumerate?: boolean
  noPadding?: boolean
  headers: Record<string, string | {
    title: string
    icon: string
  }>
}

defineProps<Props>()

const currentSlot = ref<string | null>(null)

const getTitle = (header: Props['headers'][keyof Props['headers']]) => {
  return typeof header === 'string'
    ? header
    : header.title
}
</script>

<template>
  <div
    :class="{
      'accordion': true,
      'accordion--padded': !noPadding
    }"
  >
    <div
      v-for="(slotName, index) in Object.keys($slots).filter((slotName) => slotName !== 'default')"
      :key="slotName"
      class="accordion__slot"
    >
      <div
        v-clickable
        class="accordion__header"
        @click="
          currentSlot === slotName
            ? currentSlot = null
            : currentSlot = slotName
        "
      >
        <span v-if="enumerate">{{ index + 1 }}. </span>
        {{
          headers[slotName]
            ? getTitle(headers[slotName])
            : t(slotName)
        }}
      </div>
      <div
        v-if="currentSlot === slotName"
        class="accordion__content"
      >
        <slot :name="slotName" />
      </div>
    </div>
  </div>
</template>

<style scoped src="./aeria-accordion.less"></style>
