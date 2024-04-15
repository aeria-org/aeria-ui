import type { CollectionActions, Description } from '@aeriajs/types'
import { freshItem as _freshItem } from '@aeriajs/common'

type NormalizedActions<TActions extends CollectionActions<any>> = (TActions[keyof TActions] & {
  action: string
})[]

const isObject = (property: any) =>
  property.$ref
    || property.type === 'object'
    || property.items?.$ref
    || property.items?.type === 'object'

export const condenseItem = (item?: Record<string, any>): any => {
  if( !item || item.constructor !== Object ) {
    return item
  }

  return Object.entries(item).reduce((a, [key, value]) => {
    if( Array.isArray(value) ) {
      return {
        ...a,
        [key]: value.map((v) => v?._id || condenseItem(v)),
      }
    }

    if(
      value instanceof Object
        && !(value instanceof Date)
        && !Object.keys(value).length
    ) {
      return a
    }

    return {
      ...a,
      [key]: value?._id || condenseItem(value),
    }
  }, {})
}

export const isNull = (value: any) => [
  undefined,
  null,
  '',
].includes(value)

export const removeEmpty = (item: Record<string, any>) => {
  const entries = Object.entries(item)
    .filter(([_, value]) => !isNull(value))

  return Object.fromEntries(entries)
}

export const normalizeActions = <const TActions extends CollectionActions<any>>(actions?: CollectionActions<any>) => {
  if( !actions ) {
    return [] as NormalizedActions<TActions>
  }

  return Object.entries(actions).reduce((a: object[], [key, value]) => {
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
  }, []) as NormalizedActions<TActions>
}
export const normalizeFilters = (filters: Description['filters']) => {
  return filters?.reduce((a, b) => {
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
  }, {}) || {}
}

export const freshItem = (description: Description) => _freshItem(description)

export const freshFilters = (description: Description) => {
  return Object.entries(description.properties)
    .reduce((a, [key, property]) => {
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

