export type DiffOptions = {
  preserveIds?: boolean
}

const extractId = (target: unknown) => {
  if( !target || typeof target !== 'object' || !('_id' in target) ) {
    return target
  }

  return target._id
}

export const deepDiff = <T extends Record<string, unknown>>(origin: T, target: T, options?: DiffOptions) => {
  const { preserveIds } = options || {}

  const equals = (left: unknown, right: unknown) => {
    const toStr = (obj: unknown) => {
      switch( typeof obj ) {
        case 'undefined': return 'undefined'
        case 'object': {
          if( obj ) {
            return JSON.stringify(Object.fromEntries(Object.entries(obj).sort().map(([key, value]) => [
              key,
              value,
            ])))
          }
        }

        default: return JSON.stringify(obj)
      }
    }

    return toStr(left) === toStr(right)
  }

  const changes = (target: Record<string, unknown>, origin: Record<string, unknown>): Record<string, unknown> => {
    const diff = Object.entries(target).reduce((a, [key, value]) => {
      const isUnequal = (() => {
        const left = origin[key]
        if( Array.isArray(value) && Array.isArray(left) ) {
          return !value.every((v, i) => (v === null && i !== value.length - 1) || equals(left[i], v))
            || value.length < left.length
        }

        return !equals(value, origin[key])
          && (
            (typeof value !== 'number' && !!(value || origin[key]))
              || typeof value === 'number'
              || typeof value === 'boolean'
          )
      })()

      if( isUnequal ) {
        if( value && typeof value === 'object' && origin[key] ) {
          const res = changes(value as Record<string, unknown>, origin[key] as Record<string, unknown>)

          if( Array.isArray(value) && Array.isArray(origin[key]) ) {
            a[key] = value.length < origin[key].length
              ? value
              : value.map((v, index) => res[+index] || extractId(v))

            return a
          }

          if( !('_id' in value) || !value._id ) {
            return {
              ...a,
              [key]: value,
            }
          }

          if( !Object.keys(res).length ) {
            return a
          }

          return {
            ...a,
            [key]: res,
          }
        }

        return {
          ...a,
          [key]: value,
        }
      }

      return a
    }, {} as Record<string, unknown>)

    if( preserveIds && target._id && Object.keys(diff).length > 0 ) {
      diff._id = target._id
    }

    return diff
  }

  return changes(target, origin)
}

