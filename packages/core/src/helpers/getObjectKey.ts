export const getObjectKey = (obj: any, index: number) => {
  if( obj && typeof obj === 'object' ) {
    if( '_id' in obj ) {
      return obj._id
    }
    if( 'tempId' in obj ) {
      return obj.tempId
    }
    return `object-${index}`
  }
  return `raw-${index}`
}

