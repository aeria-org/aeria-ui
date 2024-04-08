<script setup lang="ts">
import type { Property, Condition, BooleanProperty } from '@aeriajs/types'
import type { FormFieldProps } from '../types'
import { onBeforeMount, ref, computed, provide, inject, unref, type Ref } from 'vue'
import { evaluateCondition, deepClone, isRequired, getReferenceProperty } from '@aeriajs/common'
import { useBreakpoints, isDocumentComplete } from '@aeria-ui/web'
import { useStore, getStoreId, STORE_ID } from '@aeria-ui/state-management'
import { t } from '@aeria-ui/i18n'

import AeriaIcon from '../../aeria-icon/aeria-icon.vue'
import AeriaButton from '../../aeria-button/aeria-button.vue'
import AeriaSelect from '../aeria-select/aeria-select.vue'
import AeriaInput from '../aeria-input/aeria-input.vue'

import { getComponent, pushToArray, spliceFromArray } from './_internals/helpers'

type LayoutConfig = {
  span?: string
  verticalSpacing?: string
  optionsColumns?: number
  if?: Condition<any>
  component?: {
    name: string
    props?: object
  }
}

type Props = FormFieldProps<any> & {
  form?: Record<string, Property>
  collection?: string | Ref<string>
  isReadOnly?: boolean
  searchOnly?: boolean
  layout?: {
    fields: Record<string, LayoutConfig>
  }
  required?: string[]
  formComponents?: Record<string, any>
  propertyComponents?: Record<string, any>
  omitFormHeader?: boolean
  omitInputLabels?: boolean
  innerInputLabel?: boolean
  validationErrors?: Record<string, any> | null
  highlightRequired?: boolean
  focus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
  searchony: false,
  validationErrors: null,
  highlightRequired: true,
})

const emit = defineEmits<{
  (e:
    | 'update:modelValue'
    | 'input'
    | 'change',
  value: any
  ): void
}>()

onBeforeMount(() => {
  if( !props.modelValue ) {
    emit('update:modelValue', props.property && 'items' in props.property
      ? []
      : {})
  }
})

const refProperty = props.property && getReferenceProperty(props.property)
const collectionName = refProperty
    ? refProperty.$ref
    : props.collection || getStoreId()

const store = collectionName
  ? useStore(unref(collectionName))
  : null

if( !collectionName && process.env.NODE_ENV !== 'production' ) {
  console.warn(`aeria-form was used without providing storeId or specifying
    collection prop, some features may not work as intended`)
}

const alreadyFocused = ref(false)

const form = computed((): Record<string, Property> | undefined => {
  if( !props.form && props.property ) {
    if( 'properties' in props.property ) {
      return props.property.properties
    }

    return store?.properties
  }

  return props.form
})

const computedLayout = computed(() => {
  return props.layout || store?.description.formLayout
})

const passAhead = <T extends keyof Props, P extends Props[T]>(propName: T): P => {
  const value = inject<P>(propName, props[propName] as P)
  if( props[propName] ) {
    provide(propName, props[propName])
  }

  return value
}

const validationErrors = computed(() => props.validationErrors !== null
  ? props.validationErrors
  : store?.validationErrors)

const formComponents = passAhead('formComponents') || {}
const propertyComponents = passAhead('propertyComponents') || {}
const omitFormHeader = passAhead('omitFormHeader')
const omitInputLabels = passAhead('omitInputLabels')
const innerInputLabel = passAhead('innerInputLabel')

if( collectionName ) {
  provide(STORE_ID, collectionName)
}

provide('searchOnly', props.searchOnly)

const filterProperties = (condition: (f: [string, Property])=> boolean) => {
  if( !form.value ) {
    return null
  }

  return Object.entries(form.value).filter(([key, property]) => {
    return !property.noForm
      && condition([
        key,
        property,
      ])
  })
}

const has = (propertyName: string) => {
  if( props.searchOnly || !collectionName ) {
    return true
  }

  const formProperties = props.property && 'properties' in props.property
    ? props.property.form
    : store?.description?.form

  return !formProperties || formProperties.includes(propertyName)
}

const properties = filterProperties(([key]) => {
  return has(key)
})

const breakpoints = useBreakpoints()
const conditionMemo: Record<string, boolean> = {}

const fieldStyle = (key: string, property: any) => {
  const style = []
  const layout = computedLayout.value?.fields?.[key] || computedLayout.value?.fields?.$default

  if( !property ) {
    return
  }

  if( layout?.if && !props.searchOnly ) {
    const result = evaluateCondition(
      props.modelValue,
      layout.if,
    )

    if( !result.satisfied ) {
      if( conditionMemo[key] ) {
        if( store ) {
          props.modelValue[key] = typeof store.$freshItem[key] === 'object'
            ? deepClone(store.$freshItem[key])
            : store.$freshItem[key]
        } else {
          props.modelValue[key] = ![
            undefined,
            null,
          ].includes(props.modelValue[key])
            ? props.modelValue[key].constructor()
            : null
        }
      }

      style.push('display: none;')
    }

    conditionMemo[key] = result.satisfied
  }

  const span = breakpoints.value.md
    ? layout?.span || 6
    : 6

  style.push(`
    --field-span: ${span};
    grid-column: span var(--field-span) / span var(--field-span);
  `)

  if( !layout ) {
    return style.join('')
  }

  if( layout.verticalSpacing ) {
    style.push(`
      --vertical-spacing: ${layout.verticalSpacing};
      padding: var(--vertical-spacing) 0;
    `)
  }

  if( layout.separator ) {
    style.push(`
      border-top: 1px solid var(--theme-border-color);
      border-width: 1px 0 1px 0;
      padding: 1rem 0;
      margin: 1rem 0;
    `)
  }

  return style.join('')
}

const unfilled = (value: any) => {
  return value === null
    || (value instanceof Object && !Object.keys(value).length)
}

const required = computed(() => {
  return props.required
    ? props.required
    : props.property && 'required' in props.property
      ? props.property.required
      : store?.description.required
})

const isInsertReady = computed(() => {
  if( !props.form ) {
    return true
  }

  return isDocumentComplete(
    props.modelValue,
    props.form,
    required.value,
    store?.description,
  )
})

const getNestedValidationError = (key: string, listIndex?: number) => {
  if( !validationErrors.value?.[key] ) {
    return null
  }

  return typeof validationErrors.value[key].index !== 'number' || validationErrors.value[key].index === listIndex
    ? validationErrors.value[key].errors
    : null
}
</script>

<template>
  <form
    class="form"
    :style="`row-gap: ${omitFormHeader ? '.8rem' : 'var(--form-internal-gap, 1.6rem);'};`"
  >
    <header
      v-if="$slots.header && !omitFormHeader"
      class="form__header"
    >
      <slot name="header" />
    </header>

    <slot />

    <fieldset
      v-if="!isReadOnly"
      class="form__fieldset"
    >
      <div
        v-for="([fieldPropertyName, fieldProperty]) in properties"
        :key="`field-${fieldPropertyName}`"
        :style="fieldStyle(fieldPropertyName, fieldProperty)"
        class="form__field"
      >
        <label
          v-if="
            (!('type' in fieldProperty) || fieldProperty.type !== 'boolean' || searchOnly)
              && !fieldProperty.noLabel
              && !omitInputLabels
              && !innerInputLabel
          "
        >
          <div
            :class="{
              'form__field-label': true,
              'form__field-label--section': 'items' in fieldProperty
                ? 'properties' in fieldProperty.items
                : 'properties' in fieldProperty,
              'form__field-required-hint':
                highlightRequired
                && !searchOnly
                && (!required || isRequired(fieldPropertyName, required, modelValue))
            }"
          >
            {{ fieldProperty.description || t(fieldPropertyName) }}
          </div>
          <div
            v-if="fieldProperty.hint"
            v-html="fieldProperty.hint"
          />
        </label>

        <slot
          v-if="$slots[`field-${fieldPropertyName}`]"
          v-bind="{
            propery: fieldProperty,
            properyName: fieldPropertyName,
            modelValue,
          }"
          :name="`field-${fieldPropertyName}`"
        />

        <component
          :is="propertyComponents[layout.fields[fieldPropertyName].component!.name]"
          v-else-if="layout?.fields?.[fieldPropertyName]?.component && propertyComponents[layout.fields[fieldPropertyName].component!.name]"
          v-model="modelValue[fieldPropertyName]"
          v-bind="{
            property: fieldProperty,
            propertyName: fieldPropertyName,
            ...layout.fields[fieldPropertyName].component!.props||{},
          }"

          @input="emit('input', fieldPropertyName)"
          @change="emit('change', $event)"
        />

        <div
          v-else-if="
            'format' in fieldProperty
              && ['date', 'date-time'].includes(fieldProperty.format!)
              && searchOnly
          "
          style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 1rem;
          "
          @input="emit('input', fieldPropertyName)"
          @change="emit('change', $event)"
        >
          <aeria-input
            v-model="modelValue[fieldPropertyName].$gte"
            v-bind="{
              property: fieldProperty,
              propertyName: fieldPropertyName
            }"
          />
          <aeria-input
            v-model="modelValue[fieldPropertyName].$lte"
            v-bind="{
              property: fieldProperty,
              propertyName: fieldPropertyName
            }"
          />
        </div>

        <div
          v-else-if="
            'type' in fieldProperty
              && fieldProperty.type === 'boolean'
              && searchOnly
          "
        >
          <aeria-select
            v-bind="{
              property: fieldProperty as BooleanProperty,
              propertyName: fieldPropertyName,
            }"
            boolean-ref
            :model-value="modelValue[fieldPropertyName]"

            @change="emit('change', $event)"
            @update:model-value="(value) => {
              modelValue[fieldPropertyName] = value == 'true'
                ? true : value == 'false'
                  ? false : null
            }"
          >
            <option value="true">
              {{ t('yes') }}
            </option>
            <option value="false">
              {{ t('no') }}
            </option>
          </aeria-select>
        </div>

        <div
          v-else-if="
            modelValue && 'items' in fieldProperty && !fieldProperty.uniqueItems && (
              !('$ref' in fieldProperty.items)
              || (fieldProperty.items.inline || fieldProperty.items.$ref === 'file')
            )
          "
          style="display: grid; row-gap: .4rem"
        >
          <div>
            <aeria-button
              small
              variant="alt"
              icon="plus"
              :disabled="
                !('inline' in fieldProperty.items && fieldProperty.items.inline) && (
                  modelValue[fieldPropertyName]?.length >= fieldProperty.maxItems!
                  || unfilled(modelValue[fieldPropertyName]?.[modelValue[fieldPropertyName]?.length - 1])
                )
              "
              @click.prevent="
                if(!modelValue[fieldPropertyName]) modelValue[fieldPropertyName] = [];
                pushToArray(modelValue[fieldPropertyName], fieldProperty)
              "
            >
              {{ t('action.add', { capitalize: true }) }}
            </aeria-button>
          </div>

          <div
            v-for="(_, listIndex) in modelValue[fieldPropertyName]"
            :key="`rep-${fieldPropertyName}-${listIndex}`"
            style="display: flex; column-gap: .6rem; align-items: center"
          >
            <div style="flex-grow: 1">
              <component
                :is="getComponent(fieldProperty, formComponents)"
                v-model="modelValue[fieldPropertyName][listIndex]"
                v-bind="{
                  property: fieldProperty.items,
                  propertyName: fieldPropertyName,
                  parentCollection: collectionName,
                  parentPropertyName,
                  columns: layout?.fields?.[fieldPropertyName]?.optionsColumns
                    || layout?.fields?.$default?.optionsColumns,
                  validationErrors: getNestedValidationError(fieldPropertyName, listIndex),
                  ...(fieldProperty.componentProps || {})
                }"

                @input="emit('input', fieldPropertyName)"
                @change="emit('change', $event)"
              />
            </div>

            <aeria-icon
              v-clickable
              reactive
              icon="trash"
              @click="spliceFromArray(modelValue[fieldPropertyName], listIndex)"
            />
          </div>
        </div>

        <component
          :is="getComponent(fieldProperty, formComponents)"
          v-else-if="modelValue"
          v-model="modelValue[fieldPropertyName]"
          v-bind="{
            property: fieldProperty,
            propertyName: fieldPropertyName,
            parentPropertyName,
            parentCollection: collectionName,
            columns: layout?.fields?.[fieldPropertyName]?.optionsColumns
              || layout?.fields?.$default?.optionsColumns,
            ...(fieldProperty.componentProps || {}),
            validationErrors: getNestedValidationError(fieldPropertyName)
          }"

          v-focus="!alreadyFocused && (alreadyFocused = !!focus)"

          @input="emit('input', fieldPropertyName)"
          @change="emit('change', $event)"
        />

        <div
          v-if="validationErrors?.[fieldPropertyName]"
          class="form__validation-error"
        >
          <span v-if="validationErrors[fieldPropertyName].type">
            {{ t(`validation_error.${validationErrors[fieldPropertyName].type}`) }}
          </span>
          <span v-if="validationErrors[fieldPropertyName].detail">
            {{ t(validationErrors[fieldPropertyName].detail) }}
          </span>
        </div>
      </div>
    </fieldset>

    <slot
      v-if="$slots.after"
      name="after"
    />

    <div
      v-if="$slots.footer"
      class="form__footer"
    >
      <slot
        name="footer"
        v-bind="{
          isInsertReady
        }"
      />
    </div>
  </form>
</template>

<style scoped src="./aeria-form.less"></style>

