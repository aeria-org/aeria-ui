import { type Property } from '@aeriajs/types'
import { deepClone, getReferenceProperty, freshItem } from '@aeriajs/common'
import { useStore } from '@aeria-ui/state-management'

import AeriaInput from '../../aeria-input/aeria-input.vue'
import AeriaOptions from '../../aeria-options/aeria-options.vue'
import AeriaSwitch from '../../aeria-switch/aeria-switch.vue'
import AeriaSelect from '../../aeria-select/aeria-select.vue'
import AeriaFile from '../../aeria-file/aeria-file.vue'
import AeriaSearch from '../../aeria-search/aeria-search.vue'
import AeriaForm from '../../aeria-form/aeria-form.vue'

export const getComponent = (property: Property, customComponents: Record<string, any>) => {
  const nestedProp = 'items' in property
    ? property.items
    : property

  // strangely enough this won't work if placed outside function
  const defaultComponents = {
    options: AeriaOptions,
    select: AeriaSelect,
    switch: AeriaSwitch,
    file: AeriaFile,
    search: AeriaSearch,
    input: AeriaInput,
    form: AeriaForm,
  }

  const mappedComponentType = (() => {
    if( 'type' in nestedProp ) {
      if( nestedProp.type === 'object' ) {
        return 'form'
      }
      if( nestedProp.type === 'boolean' ) {
        return 'switch'
      }
    }

    if( 'element' in property ) {
      if( property.element === 'checkbox' || property.element === 'radio' ) {
        return 'options'
      }
      if( property.element === 'select' ) {
        return 'select'
      }
    }

    const ref = getReferenceProperty(property)
    if( ref ) {
      if( ref.inline ) {
        return 'form'
      }
      if( ref.$ref === 'file' ) {
        return 'file'
      }

      return 'search'
    }

    if( 'items' in property ) {
      if( property.uniqueItems ) {
        return 'options'
      }
    }

    if( 'enum' in nestedProp ) {
      return 'select'
    }

    return 'input'

  })()

  if( customComponents[mappedComponentType] ) {
    return customComponents[mappedComponentType]
  }

  return defaultComponents[mappedComponentType]
}

export const pushToArray = (modelValue: any[] | undefined, property: Property) => {
  modelValue ??= []
  const nestedProp = 'items' in property
    ? property.items
    : property

  if( '$ref' in property ) {
    const helperStore = useStore(property.$ref)
    const newVal = deepClone(helperStore.$freshItem)
    return modelValue.unshift(newVal)
  }

  if( 'properties' in nestedProp ) {
    return modelValue.unshift(freshItem(nestedProp))
  }

  if( 'type' in nestedProp && nestedProp.type === 'boolean' ) {
    return modelValue.unshift({})
  }

  return modelValue.unshift(null)
}

export const spliceFromArray = (modelValue: any[], index: number) => {
  modelValue.splice(index, 1)
}
