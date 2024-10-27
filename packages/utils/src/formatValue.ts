import type { Property } from '@aeriajs/types'
import { formatDateTime } from './date.js'

export const formatValue = (value: unknown, property: Property, index?: string): string => {
  if( value === null || value === undefined ) {
    return '-'
  }

  if( 'items' in property ) {
    if( !Array.isArray(value) ) {
      return String(value)
    }
    return value.map((v) => formatValue(v, property.items, index)).join(', ')
  }

  if( 'properties' in property ) {
    if( Object.values(property.properties).length === 0 ) {
      return Object.values(value)[0]
    }

    const firstProperty = Object.values(property.properties)[0]
    return formatValue(Object.values(value)[0], firstProperty)
  }

  if( '$ref' in property ) {
    const firstIndex = index || property.indexes?.[0]
    if( firstIndex ) {
      return String((value as Record<string, unknown>)[firstIndex])
    }

    return Object.values(value)[0]
  }

  if( 'type' in property ) {
    switch( property.type ) {
      case 'string': {
        switch( property.format ) {
          case 'date': return formatDateTime(value as string)
          case 'date-time': return formatDateTime(value as string, {
            hours: true,
          })
          default:
            return String(value)
        }
      }
    }
  }

  return String(value)
}

