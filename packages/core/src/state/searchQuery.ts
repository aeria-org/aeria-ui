import type { Property } from '@aeriajs/types'
import type { CollectionStore } from './collection.js'

export type DateTuple = {
  $gte?: Date
  $lte?: Date
}

const isDateTuple = (value: unknown): value is DateTuple => {
  return !!(
    value
    && typeof value === 'object'
    && (!('$gte' in value) || (typeof value.$gte === 'object' && value.$gte instanceof Date))
    && (!('$lte' in value) || (typeof value.$lte === 'object' && value.$lte instanceof Date))
  )
}

const dateTupleToString = (tuple: DateTuple) => {
  return `${tuple.$gte?.toISOString() || ''}|${tuple.$lte?.toISOString() || ''}`
}

const extractValue = (value: unknown, property: Property) => {
  if( 'type' in property ) {
    switch( property.type ) {
      case 'string': {
        if( (property.format === 'date' || property.format === 'date-time') && isDateTuple(value) ) {
          return dateTupleToString(value)
        }

        return value && typeof value === 'object' && '$regex' in value
          ? String(value.$regex)
          : undefined
      }
    }
  }

  return String(value)
}

const buildValue = (value: unknown, property: Property) => {
  if( 'items' in property ) {
    return {
      $in: Array.isArray(value)
        ? value
        : [value],
    }
  }

  if( 'type' in property ) {
    switch( property.type ) {
      case 'string': {
        if( typeof value !== 'string' ) {
          return value
        }
        if( property.format === 'date' || property.format === 'date-time' ) {
          const [d1, d2] = value.split('|')
          const obj: DateTuple = {}

          if( d1 ) {
            obj.$gte = new Date(d1)
          }
          if( d2 ) {
            obj.$lte = new Date(d2)
          }

          return obj
        }
        break
      }
      case 'boolean': {
        return value === 'true'
      }
    }
  }

  return value
}

export const convertToSearchQuery = (store: CollectionStore) => {
  const entries: [string, string | string[] | undefined][] = []
  for( const [key, value] of Object.entries(store.activeFilters) ) {
    const property = key in store.properties
      ? store.properties[key]
      : null

    if( !property || value === undefined ) {
      continue
    }

    if( 'items' in property ) {
      if( !value ) {
        continue
      }

      if( typeof value !== 'object' || !('$in' in value) || !Array.isArray(value.$in) ) {
        continue
      }

      const queryValue = value.$in.reduce((a: string[], elem: unknown) => {
        const val = extractValue(elem, property.items)
        if( !val ) {
          return a
        }

        return [
          ...a,
          val,
        ]
      }, [])

      entries.push([
        `${store.$id}.${key}[]`,
        queryValue,
      ])
      continue
    }

    const queryValue = extractValue(value, property)
    if( queryValue ) {
      entries.push([
        `${store.$id}.${key}`,
        queryValue,
      ])
    }
  }

  return Object.fromEntries(entries)
}

export const convertFromSearchQuery = (store: CollectionStore, query: Record<string, unknown>) => {
  const entries: [string, unknown][] = []
  for( const [key, value] of Object.entries(query) ) {
    const prefix = `${store.$id}.`
    if( !key.startsWith(prefix) ) {
      continue
    }

    const propName = key.endsWith('[]')
      ? key.slice(prefix.length, -2)
      : key.slice(prefix.length)

    if( propName === '_id' ) {
      entries.push([
        propName,
        buildValue(value, {
          type: 'string',
        }),
      ])
      continue
    }

    const property = propName in store.properties
      ? store.properties[propName]
      : null

    if( !property ) {
      continue
    }

    entries.push([
      propName,
      buildValue(value, property),
    ])
  }

  return Object.fromEntries(entries)
}

