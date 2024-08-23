import type { Property } from '@aeriajs/types'
import type { RouteRecordNormalized } from 'vue-router'
import type { CollectionStore } from './collection.js'

export type DateTuple = {
  $gte?: string
  $lte?: string
}

const isDateTuple = (value: unknown): value is DateTuple => {
  return !!(
    value
    && typeof value === 'object'
    && '$gte' in value
    && '$lte' in value
    && typeof value.$gte === 'string'
    && typeof value.$lte === 'string'
  )
}

const dateTupleToString = (tuple: DateTuple) => {
  if( !tuple.$gte || !tuple.$lte ) {
    return
  }

  return `${tuple.$gte}|${tuple.$lte}`
}

const extractValue = (value: unknown, property: Property) => {
  if( 'type' in property ) {
    if( property.type === 'string' ) {
      if( (property.format === 'date' || property.format === 'date-time') && isDateTuple(value) ) {
        return dateTupleToString(value)
      }

      return value && typeof value === 'object' && '$regex' in value
        ? value.$regex
        : undefined
    }
  }

  return value
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
    if( property.type === 'string' && typeof value === 'string' ) {
      if( property.format === 'date' || property.format === 'date-time' ) {
        const [d1, d2] = value.split('|')
        return {
          $gte: new Date(d1),
          $lte: new Date(d2),
        }
      }
    }
  }

  return value
}

export const convertToSearchQuery = (store: CollectionStore) => {
  const entries: [string, string][] = []
  for( const [key, value] of Object.entries(store.activeFilters) ) {
    const property = key in store.properties
      ? store.properties[key]
      : null

    if( !property || !value ) {
      continue
    }

    const queryKey = 'items' in property
      ? `${store.$id}.${key}[]`
      : `${store.$id}.${key}`

    const queryValue = 'items' in property
      ? value.$in.reduce((a: unknown[], elem: unknown) => {
        const val = extractValue(elem, property.items)

        if( !val ) {
          return a
        }

        return [
          ...a,
          val,
        ]
      }, [])
      : extractValue(value, property)

    if( !queryValue ) {
      continue
    }

    entries.push([
      queryKey,
      queryValue,
    ])
  }

  return Object.fromEntries(entries)
}

export const convertFromSearchQuery = (store: CollectionStore, route: RouteRecordNormalized) => {
  const entries: [string, unknown][] = []
  if( !('query' in route) ) {
    return {}
  }

  for( const [key, value] of Object.entries(route.query as Record<string, unknown>) ) {
    const prefix = `${store.$id}.`
    if( !key.startsWith(prefix) ) {
      continue
    }

    const propName = key.endsWith('[]')
      ? key.slice(prefix.length, -2)
      : key.slice(prefix.length)

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

