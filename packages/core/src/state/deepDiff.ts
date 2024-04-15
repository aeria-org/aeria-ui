export type DiffOptions = {
  preserveIds?: boolean
}
export const deepDiff = <T extends Record<string, any>>(origin: T, target: T, options?: DiffOptions) => {
  const { preserveIds } = options || {}

  const equals = (left: any, right: any) => {
    const toStr = (obj: any) => {
      const sortedObj = obj && obj.constructor === Object
        ? Object.fromEntries(Object.keys(obj).sort().map((key) => [
          key,
          obj[key],
        ]))
        : obj

      return JSON.stringify(sortedObj)
    }

    return toStr(left) === toStr(right)
  }
  const changes = (target: T, origin: T): any => {
    const diff = Object.entries(target).reduce((a: any, [key, value]) => {
      const isUnequal = (() => {
        if( Array.isArray(value) && Array.isArray(origin[key]) ) {
          return !value.every((v, i) => (v === null && i !== value.length - 1) || equals(origin[key][i], v))
            || value.length < origin[key].length
        }

        return !equals(value, origin[key])
          && (
            (typeof value !== 'number' && (value || origin[key]))
              || typeof value === 'number'
              || typeof value === 'boolean'
          )
      })()

      if( isUnequal ) {
        if( value?.constructor === Object && origin[key]?.constructor === Object ) {
          if( !value._id ) {
            return {
              ...a,
              [key]: value,
            }
          }

          const res = changes(value, origin[key])

          if( Array.isArray(value) ) {
            a[key] = value.length < origin[key].length
              ? value
              : value.map((v, index) => res[+index] || v)

            return a
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
    }, {})

    if( preserveIds && target._id && Object.keys(diff).length > 0 ) {
      diff._id = target._id
    }

    return diff
  }

  return changes(target, origin)
}
