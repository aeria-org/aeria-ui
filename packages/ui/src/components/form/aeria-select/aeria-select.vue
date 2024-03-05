<script setup lang="ts">
import type { Property, EnumProperty, BooleanProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types'
import { ref, computed, watch } from 'vue'
import { t } from '@aeria-ui/i18n'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'

type Props = FormFieldProps<any, Property & (EnumProperty | BooleanProperty)> & {
  booleanRef?: boolean
  multiple?: boolean | number
  noOutline?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', value: any): void
}>()

const select = ref<HTMLSelectElement | null>(null)

const property = props.property || {} as NonNullable<typeof props.property>
const update = (value: any) => {
  if( props.booleanRef ) {
    modelValue.value = value
  }

  emit('update:modelValue', value?._id || value)
  emit('change', value?._id || value)
}

const modelValue = !props.booleanRef
  ? computed({
    get: () => props.modelValue,
    set: update,
  })
  : (() => {
    const value = ref(props.modelValue)
    const comp = computed({
      get: () => value.value === 'true'
        ? true
: value.value === 'false'
        ? false
: null,
      set: (newVal) => {
        value.value = newVal
      },
    })

    return comp
  })()

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
  <div
    :class="{
      'select': true,
      'select--outline': !noOutline
    }"
  >
    <select
      ref="select"
      :value="modelValue"
      v-bind="{
        size: multiple
      }"

      :class="{
        'select__select': true,
        'select__select--multiple': !!props.multiple
      }"

      @change="update(($event.target as any).value)"
    >
      <aeria-icon
        v-if="property.icon"
        :icon="property.icon"
      />

      <option
        v-if="!props.multiple"
        value=""
      >
        {{ t('none') }}
      </option>

      <option
        v-for="option in 'enum' in property ? property.enum : []"
        :key="option"
        :value="option"
        :data-selected="isSelected(option)"
      >
        {{
          property.translate
            ? t(option)
            : option
        }}
      </option>

      <slot />
    </select>
  </div>
</template>

<style scoped src="./aeria-select.less"></style>
