import type { CollectionAction, CollectionActions, Description, Property, RefProperty, ObjectProperty } from '@aeriajs/types'
import { freshItem as _freshItem } from '@aeriajs/common'

export type NormalizedActions = (CollectionAction & {
  action: string
})[]

const isObject = (property: Property): property is RefProperty | ObjectProperty => {
  if( 'items' in property ) {
    return isObject(property.items)
  }

  return '$ref' in property || ('type' in property && property.type === 'object')
}

export const isNull = (value: unknown): value is undefined => {
  return !!(value === undefined
    || value === null
    || value === '')
}

export const normalizeActions = (actions?: CollectionActions) => {
  if( !actions ) {
    return []
  }

  return Object.entries(actions).reduce((a: NormalizedActions, [key, value]) => {
    if( !value || key.startsWith('_') ) {
      return a
    }

    return [
      ...a,
      {
        action: key,
        ...value,
      },
    ]
  }, [])
}
export const normalizeFilters = (filters: Description['filters']) => {
  if( !filters ) {
    return {}
  }

  return filters.reduce((a, b) => {
    const filter = typeof b === 'object'
      ? {
        [b.property]: b.default || '',
      }
      : {
        [b]: '',
      }

    return {
      ...a,
      ...filter,
    }
  }, {})
}

export const freshItem = (description: Description) => _freshItem(description)

export const freshFilters = (description: Description) => {
  return Object.entries(description.properties).reduce((a, [key, property]) => {
    if( isObject(property) ) {
      return {
        ...a,
        [key]: 'items' in property
          ? []
          : {},
      }
    }

    if( 'format' in property && property.format ) {
      if( [
        'date',
        'date-time',
      ].includes(property.format) ) {
        return {
          ...a,
          [key]: {
            $gte: '',
            $lte: '',
          },
        }
      }
    }

    return a
  }, {})
}

