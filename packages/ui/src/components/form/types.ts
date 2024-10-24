import type { Property, RefProperty, ArrayProperty } from '@aeriajs/types'

export type FormFieldProps<TModelValue, TProperty = Property> = {
  modelValue?: TModelValue
  property?: TProperty
  propertyName?: string
  parentPropertyName?: string
  parentCollection?: string
  readOnly?: boolean
  required?: boolean
}

export type SearchProperty = RefProperty | ArrayProperty<RefProperty>

export type UploadedFile = {
  tempId?: string
  file: File
}

