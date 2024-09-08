<script setup lang="ts">
import type { PropertyBase, ArrayProperty, EnumProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types.js'
import { onBeforeMount } from 'vue'
import AeriaCheckbox from '../aeria-checkbox/aeria-checkbox.vue'

type Props = Omit<FormFieldProps<any>, 'property'> & {
  property: PropertyBase & (EnumProperty | (ArrayProperty & { items: EnumProperty }))
  columns?: number
}

type Emits = {
  (e: 'update:modelValue', value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  columns: 1,
})

const emit = defineEmits<Emits>()

const readOnly = props.readOnly || props.property.readOnly
const options = 'items' in props.property
  ? props.property.items.enum
  : props.property.enum

const updateValue = (value: any) => {
  emit('update:modelValue', value)
}

onBeforeMount(() => {
  if( !props.modelValue ) {
    emit(
      'update:modelValue',
      'items' in props.property
        ? []
        : '',
    )
  }
})
</script>

<template>
  <div
    class="options"
    :style="`
      --columns: ${columns};
      grid-template-columns: repeat(var(--columns), 1fr);
    `"
  >
    <div
      v-for="option in options"
      :key="`option-${option}`"
      class="options__checkbox"
    >
      <aeria-checkbox
        v-bind="{
          value: option,
          readOnly,
          property
        }"

        :model-value="modelValue"
        @update:model-value="updateValue"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<style scoped src="./aeria-options.less"></style>

