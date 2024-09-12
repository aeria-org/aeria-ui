export const condenseItem = (item: unknown, depth = 0): unknown => {
  if( !item || typeof item !== 'object' || item.constructor !== Object ) {
    return item
  }

  if( depth && '_id' in item ) {
    return item._id
  }

  const result: Record<string, unknown> = {}
  for( const [key, value] of Object.entries(item) ) {
    if( !value ) {
      result[key] = value
      continue
    }
    if( Array.isArray(value) ) {
      result[key] = value.map((elem) => condenseItem(elem, depth++))
      continue
    }

    result[key] = condenseItem(value, depth++)
  }

  return result
}

