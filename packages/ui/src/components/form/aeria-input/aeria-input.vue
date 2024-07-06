<script setup lang="ts">
import type { Property, NumberProperty, StringProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types'
import { ref, inject, watch, onMounted } from 'vue'
import { useMask } from '@aeria-ui/core'
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

type InputBind = {
  name?: string
  type: string
  placeholder?: string
  min?: number
  max?: number
  minlength?: number
  maxlength?: number
  readonly?: boolean
  mask?: string | readonly string[]
  maskedValue?: boolean
}

type Props = FormFieldProps<InputType, Property & (NumberProperty | StringProperty)> & {
  variant?: InputVariant,
}

type Emits = {
  (e: 'update:modelValue' | 'input', value: InputType): void
  (e: 'change', value: any): void
  (e: 'clipboardCopy', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const property = props.property || {} as NonNullable<typeof props.property>
const hasIcon = 'icon' in property || ('inputType' in property && property.inputType === 'search')

const searchOnly = inject<boolean>('searchOnly', false)
const innerInputLabel = inject<boolean>('innerInputLabel', false)
const readOnly = !searchOnly && (props.readOnly || property.readOnly)

const copyToClipboard = (text: string) => {
  emit('clipboardCopy', text)
  return navigator.clipboard.writeText(text)
}

const variant = inject<InputVariant | undefined>('inputVariant', props.variant) || 'normal'

const inputBind: InputBind = Object.assign(Object.assign({}, props), {
  name: props.propertyName,
  readonly: readOnly,
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
})

if( 'type' in property ) {
  if( property.type === 'number' || property.type === 'integer' ) {
    if( property.minimum ) {
      inputBind.min = property.minimum
    }
    if( property.exclusiveMinimum ) {
      inputBind.min = property.exclusiveMinimum + 1
    }
    if( property.maximum ) {
      inputBind.max = property.maximum
    }
    if( property.exclusiveMaximum ) {
      inputBind.max = property.exclusiveMaximum - 1
    }
  }

  if( property.type === 'string' ) {
    if( property.format === 'date' || property.format === 'date-time' ) {
      inputBind.type = !searchOnly && property.format === 'date-time'
        ? 'datetime-local'
        : 'date'
    }

    inputBind.minlength = property.minLength
    inputBind.maxlength = property.maxLength
  }
}

if( inputBind.type === 'text' && searchOnly ) {
  inputBind.type = 'search'
}
onMounted(() => {
  if(props.modelValue !== null) {
    updateValue(props.modelValue)
  }
})

const getDatetimeString = (value: InputType) => {
  try {
    const date = typeof value === 'string'
      ? new Date(value).toISOString().slice(0, 19)
      : ''
    return date
  } catch( err ) {
    return ''
  }
}

const inputValue = ref<InputType>('')

const mask: ReturnType<typeof useMask> | null = props.property?.type === 'string' && props.property.mask
  ? useMask(props.property.mask)
  : null

watch(() => props.modelValue, (value) => {
  inputValue.value = (() => {
    if( mask ) {
      if( !value ) {
        return ''
      }
      return mask.enmask(String(value), undefined, {
        defaultValue: true,
      })
    }
    switch( inputBind.type ) {
      case 'date':
      case 'datetime-local':
        return getDatetimeString(value)
    }
    switch( value ) {
      case null:
      case undefined:
        return ''
      default:
        return value
    }
  })()
}, {
  immediate: true,
})

const computeString = (value: string) => {
  if( typeof inputValue.value === 'string' && props.property?.type === 'string' && mask !== null ) {
    inputValue.value = mask.enmask(inputValue.value, undefined, {
 defaultValue: true,
})
    return props.property.maskedValue === true
      ? inputValue.value
      : mask.unmask(inputValue.value)
  }
  return value
}

const updateValue = (value: InputType) => {
  const newVal = (() => {
    if( !value || typeof value !== 'string' ) {
      return value
    }
    if( inputBind.type === 'number' || inputBind.type === 'integer' ) {
      return Number(value)
    }

    if( !('type' in property && property.type === 'string') ) {
      return computeString(value)
    }

    switch( property.format ) {
      case 'date':
      case 'date-time': {
        return new Date(value)
      }

      default: return computeString(value)
    }
  })()

  emit('input', newVal)
  emit('update:modelValue', newVal)
}

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  inputValue.value = value!
  updateValue(value)
}
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
        v-focus="property.focus"
        v-bind="inputBind"
        :value="inputValue"
        data-component="input"

        :class="`
          input__input
          input__input--${variant}
          ${hasIcon && 'input__input--icon'}
          ${readOnly && 'input__input--readOnly'}
        `"

        @input="onInput"
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
            reactive
            icon="clipboard"
            @click.prevent="copyToClipboard(String(modelValue || ''))"
          />
        </aeria-info>
      </div>
    </div>

  </label>
</template>

<style scoped src="./aeria-input.less"></style>

