<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import type { Property, BooleanProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types.js'

type Props = FormFieldProps<any, Property & BooleanProperty>

type Emits = {
  (e: 'update:modelValue' | 'change', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const property = props.property
const readOnly = props.readOnly || property?.readOnly

const toggle = () => {
  if( !readOnly ) {
    emit('change', !props.modelValue)
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div class="switch-wrapper">
    <a
      v-clickable="{
        blocked: readOnly
      }"

      :class="`
        switch
        ${modelValue && 'switch--active'}
        ${readOnly && 'switch--readOnly'}
      `"
      @click.stop="toggle"
    >
      <div class="switch__slider" />
      <div
        :class="`
        switch__dummy
        ${!modelValue && 'switch__dummy--flex'}
      `"
      />
    </a>

    <slot v-if="$slots.default" />

    <div v-else>
      {{ property?.description || propertyName }}
    </div>
  </div>
</template>

<style scoped src="./aeria-switch.less"></style>
