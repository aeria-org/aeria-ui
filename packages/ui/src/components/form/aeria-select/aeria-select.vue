<script setup lang="ts">
import type { Property, EnumProperty, BooleanProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types.js'
import { ref, computed, watch } from 'vue'
import { t } from '@aeria-ui/i18n'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'
import AeriaInput from '../aeria-input/aeria-input.vue'

type Props = FormFieldProps<any, Property & (EnumProperty | BooleanProperty)> & {
  booleanRef?: boolean
  multiple?: boolean | number
  noOutline?: boolean
}

type Emits = {
  (e: 'update:modelValue' | 'change', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const select = ref<HTMLSelectElement | null>(null)
const property = props.property

const emitUpdate = (value: unknown) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const update = (value: unknown) => {
  if( value === '' || value === undefined ) {
    emitUpdate(undefined)
  } else if( props.booleanRef ) {
    emitUpdate(value === 'true')
  } else {
    emitUpdate(value)
  }
}

const isSelected = (option: any) => {
  return Array.isArray(props.modelValue)
    ? props.modelValue.includes(option)
    : props.modelValue === option
}

const multiple = computed(() => {
  return props.multiple
      ? typeof props.multiple === 'number'
        ? props.multiple
        : 5
      : 1
})

if( !!props.multiple ) {
  watch(() => props.modelValue, (value) => {
    if( !select.value ) {
      return
    }

    const prev = select.value.querySelector('option[data-selected="true"]')
    if( prev ) {
      prev.removeAttribute('data-selected')
    }

    select.value.querySelector(`option[value="${value}"]`)?.
      setAttribute('data-selected', 'true')
  })
}
</script>

<template>
  <select
    v-if="!readOnly"
    v-bind="{
      size: multiple,
      value: modelValue,
    }"
    ref="select"

    :class="{
      'select': true,
      'select--multiple': !!multiple,
      'select--outline': !noOutline,
    }"

    @change="update(($event.target as any).value)"
  >
    <aeria-icon
      v-if="property && property.icon"
      :icon="property.icon"
    />

    <option
      v-if="!props.multiple"
      value=""
    >
      {{ t('none') }}
    </option>

    <option
      v-for="option in property && 'enum' in property
        ? property.enum
        : []"
      :key="option"
      :value="option"
      :data-selected="isSelected(option)"
    >
      {{
        property?.translate
          ? t(option)
          : option
      }}
    </option>

    <slot />
  </select>

  <aeria-input
    v-else
    read-only
    :model-value="modelValue"
  />
</template>

<style scoped src="./aeria-select.less"></style>
