import type { Property, RefProperty, ArrayOfRefs } from '@aeriajs/types'

export type FormFieldProps<TModelValue, TProperty = Property> = {
  modelValue?: TModelValue
  property?: TProperty
  propertyName?: string
  parentPropertyName?: string
  parentCollection?: string
}

export type SearchProperty = RefProperty | ArrayOfRefs
