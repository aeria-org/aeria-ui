<script setup lang="ts">
import type { Property, NumberProperty, StringProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types'
import { ref, inject, watch } from 'vue'
import { type MaskaDetail, vMaska } from 'maska'
import { useClipboard } from '@aeria-ui/web'

import AeriaInfo from '../../aeria-info/aeria-info.vue'
import AeriaIcon from '../../aeria-icon/aeria-icon.vue'

type InputType =
  | string
  | number
  | Date
  | null
  | undefined

type InputVariant =
  | 'normal'
  | 'bold'
  | 'light'

type Props = FormFieldProps<InputType, Property & (NumberProperty | StringProperty)> & {
  variant?: InputVariant
}

const props = defineProps<Props>()
const property = props.property || {} as NonNullable<typeof props.property>
const hasIcon = 'icon' in property || ('inputType' in property && property.inputType === 'search')

const searchOnly = inject<boolean>('searchOnly', false)
const innerInputLabel = inject<boolean>('innerInputLabel', false)
const readOnly = !searchOnly && property.readOnly

const copyToClipboard = useClipboard()

const emit = defineEmits<{
  (e: 'update:modelValue' | 'input', value: InputType): void
  (e: 'change', value: any): void
}>()

const variant = inject<InputVariant | undefined>('inputVariant', props.variant) || 'normal'

const inputBind: {
  type: string
  placeholder?: string
  min?: number
  max?: number
  name?: string
  readonly?: boolean
} = {
  type: (() => {
    if( 'type' in property ) {
      switch( property.type ) {
        case 'number':
        case 'integer':
          return 'number'
      }
    }

    if( property.inputType ) {
      return property.inputType
    }

    switch( typeof props.modelValue ) {
      case 'string': return 'text'
      case 'number': return 'number'
      default: return 'text'
    }
  })(),
  placeholder: innerInputLabel
    ? property.description || props.propertyName
    : property.placeholder,
}

if( 'type' in property ) {
  if( property.type === 'number' ) {
    inputBind.min = property.minimum || property.exclusiveMinimum
    inputBind.max = property.maximum || property.exclusiveMaximum
  }

  inputBind.name = props.propertyName
  inputBind.readonly = readOnly

  if( property.type === 'string' && [
    'date',
    'date-time',
  ].includes(property.format!) ) {
    inputBind.type = !searchOnly && property.format === 'date-time'
      ? 'datetime-local'
      : 'date'
  }
}

if( inputBind.type === 'text' && searchOnly ) {
  inputBind.type = 'search'
}

const getDatetimeString = () => {
  try {
    const date = props.modelValue
      ? new Date(props.modelValue).toISOString().split('T').shift()
      : ''
    return date
  } catch( e ) {
    return ''
  }
}

const inputValue = ref([
  'date',
  'date-time',
].includes(inputBind.type)
    ? getDatetimeString()
    : props.modelValue === null || props.modelValue === undefined
      ? ''
      : props.modelValue)

const updateValue = (value: InputType) => {
  const newVal = (() => {
    if( inputBind.type === 'number' ) {
      return Number(value)
    }

    if( !('type' in property && property.type === 'string') ) {
      return value
    }

    switch( property.format ) {
      case 'date':
      case 'date-time': {
        return new Date(value as string)
      }

      default: return value
    }
  })()

  emit('input', newVal)
  emit('update:modelValue', newVal)
}

const onInput = (
  event: CustomEvent<MaskaDetail> | Event,
  options?: {
    masked?: true
  },
) => {
  const { masked } = options || {}

  const value = inputValue.value = (event.target as HTMLInputElement).value
  const newValue = masked
    ? (<CustomEvent<MaskaDetail>>event).detail.unmasked
    : value

  updateValue(newValue)
}

watch(() => props.modelValue, (value, oldValue) => {
  if( value instanceof Date ) {
    return
  }

  if( oldValue && !value ) {
    inputValue.value = undefined
  } else if( value && oldValue === undefined ) {
    inputValue.value = value
  }
})
</script>

<template>
  <label class="input">
    <div
      v-if="!innerInputLabel"
      class="input__label"
    >
      <slot v-if="$slots.default" />
      <slot
        v-else
        name="description"
      />
    </div>
    <div
      v-if="$slots.hint"
      class="input__hint"
    >
      <slot name="hint" />
    </div>

    <div
      v-if="'element' in property && property.element === 'textarea'"
      :class="`
        input__container
        input__container--${variant}
    `"
    >
      <textarea
        v-focus="property.focus"
        :placeholder="inputBind.placeholder"
        :readonly="inputBind.readonly"
        :value="modelValue as string"
        :class="`
          input__textarea
          input__input--${variant}
        `"

        @input="onInput"
      />
    </div>

    <div
      v-else
      :class="`
        input__container
        input__container--${variant}
    `"
    >
      <input
        v-maska
        v-focus="property.focus"
        v-bind="inputBind"
        :value="inputValue"
        data-component="input"
        :data-maska="
          'mask' in property
            ? property.mask
            : ''
        "

        :class="`
          input__input
          input__input--${variant}
          ${hasIcon && 'input__input--icon'}
          ${readOnly && 'input__input--readOnly'}
        `"

        @maska="onInput($event, { masked: true })"
        @change="emit('change', $event)"
      >
      <aeria-icon
        v-if="hasIcon"
        :icon="property.icon || 'magnifying-glass'"
        :class="`
          input__icon
          input__icon--${variant}
      `"
      />

      <div
        v-if="readOnly"
        class="input__clipboard"
      >
        <aeria-info>
          <template #text>Copiar</template>
          <aeria-icon
            v-clickable
            icon="clipboard"
            @click="copyToClipboard(String(modelValue || ''))"
          />
        </aeria-info>
      </div>
    </div>

  </label>
</template>

<style scoped src="./aeria-input.less"></style>
