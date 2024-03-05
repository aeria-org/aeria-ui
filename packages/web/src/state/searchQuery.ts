import type { Property } from '@aeriajs/types'
import type { RouteRecordNormalized } from 'vue-router'
import type { CollectionStore } from './collection.js'

const dateTupleToString = (tuple: { $gte?: string, $lte?: string }) => {
  if( !tuple.$gte || !tuple.$lte ) {
    return
  }

  return `${tuple.$gte}|${tuple.$lte}`
}

const extractValue = (value: any, property: Property) => {
  if( 'type' in property ) {
    if( property.type === 'string' ) {
      if( property.format === 'date' || property.format === 'date-time' ) {
        return dateTupleToString(value)
      }

      return value.$regex
    }
  }

  return value
}

const buildValue = (value: any, property: Property) => {
  if( 'items' in property ) {
    return {
      $in: Array.isArray(value)
        ? value
        : [value],
    }
  }

  if( 'type' in property ) {
    if( property.type === 'string' ) {
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
      ? value.$in.reduce((a: any[], elem: any) => {
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
  const entries: [string, any][] = []
  if( !('query' in route) ) {
    return {}
  }

  for( const [key, value] of Object.entries(route.query as Record<string, any>) ) {
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

