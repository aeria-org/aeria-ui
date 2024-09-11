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
  return `${tuple.$gte}|${tuple.$lte}`
}

const extractValue = (value: unknown, property: Property) => {
  if( 'type' in property ) {
    if( property.type === 'string' ) {
      if( (property.format === 'date' || property.format === 'date-time') && isDateTuple(value) ) {
        return dateTupleToString(value)
      }

      return value && typeof value === 'object' && '$regex' in value
        ? String(value.$regex)
        : undefined
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
  const entries: [string, string | string[] | undefined][] = []
  for( const [key, value] of Object.entries(store.activeFilters) ) {
    const property = key in store.properties
      ? store.properties[key]
      : null

    if( !property || !value ) {
      continue
    }

    if( 'items' in property ) {
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

    if( propName === '_id' ) {
      entries.push([
        propName,
        buildValue(value, {
          type: 'string',
        })
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

