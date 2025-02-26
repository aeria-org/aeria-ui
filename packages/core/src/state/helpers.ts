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

export const isEmpty = (value: unknown): value is undefined | null | '' => {
  return !!(value === undefined
    || value === null
    || value === '')
}

export const normalizeActions = (actions: CollectionActions = {}) => {
  const normalizedActions: NormalizedActions = []
  for( const actionName in actions ) {
    const action = actions[actionName]
    if( !action ) {
      continue
    }

    normalizedActions.push({
      action: actionName,
      ...action,
    })
  }

  return normalizedActions
}

export const normalizeFilters = (filters: Description['filters']) => {
  if( !filters ) {
    return {}
  }

  const normalizedFilters: Record<string, unknown> = {}
  for( const filter of filters ) {
    switch( typeof filter ) {
      case 'object': {
        normalizedFilters[filter.property] = filter.default
        break
      }
      default: {
        normalizedFilters[filter] = ''
      }
    }
  }

  return normalizedFilters
}

export const freshItem = (description: Description) => _freshItem(description)

export const freshFilters = (description: Description) => {
  const filters: Record<string, unknown> = {}

  for( const [key, property] of Object.entries(description.properties) ) {
    if( isObject(property) ) {
      filters[key] = 'items' in property
        ? []
        : {}
      continue
    }

    if( 'format' in property ) {
      switch( property.format ) {
        case 'date':
        case 'date-time': {
          filters[key] = {
            $gte: '',
            $lte: '',
          }
          continue
        }
      }
    }
  }

  return filters
}

