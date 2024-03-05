import type { Property, RequiredProperties, Description } from '@aeriajs/types'
import { getMissingProperties, getReferenceProperty, checkForUndefined } from '@aeriajs/common'

export const isDocumentComplete = <
  TItem extends Record<string, any>,
  TProperties extends Record<string, Property>,
>(
  item: TItem,
  properties: TProperties,
  required?: RequiredProperties<any>,
  description?: Description,

) => {
  const formIncludes = (key: string) => {
    const form = description?.form!
    return Array.isArray(form)
      ? form.includes(key)
      : key in form
  }

  const requiredKeys = required || Object.keys(properties)

  const missingProps = description
    ? getMissingProperties(item, description, requiredKeys)
    : Array.isArray(requiredKeys)
      ? requiredKeys.filter((key: any) => checkForUndefined(properties[key], key, item))
      : []

  return missingProps.every((key) => {
    const property = properties[key]

    return (
      description?.form && formIncludes(key)
      || getReferenceProperty(property)
    )
  })
}

