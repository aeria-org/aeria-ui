import type { Property, EndpointError } from '@aeriajs/types'
import { Result } from '@aeriajs/types'
import { getReferenceProperty } from '@aeriajs/common'
import { useStore, type GlobalStateManager } from '@aeria-ui/state-management'

export const recurseInsertCandidate = async (obj: any, property: Property | undefined, manager: GlobalStateManager): Promise<Result.Either<EndpointError, any>> => {
  if( !property ) {
    return Result.result(obj)
  }

  if( 'properties' in property ) {
    const entries: [string, string][] = []
    for( const key in obj ) {
      const { error, result } = await recurseInsertCandidate(obj[key], property.properties[key], manager)
      if( error ) {
        return Result.error(error)
      }

      entries.push([
        key,
        result,
      ])
    }

    return Result.result(Object.fromEntries(entries))
  }

  if( 'items' in property ) {
    const arr: string[] = []
    for( const elem of obj ) {
      const { error, result } = await recurseInsertCandidate(elem, property.items, manager)
      if( error ) {
        return Result.error(error)
      }

      arr.push(result)
    }
    return Result.result(arr)
  }

  if( 'inline' in property && property.inline ) {
    const collection = getReferenceProperty(property)!.$ref
    const helperStore = useStore(collection, manager)

    const { error, result } = await helperStore.$actions.deepInsert({
      what: obj,
    })

    return error
      ? Result.error(error)
      : Result.result(result._id)
  }

  return Result.result(obj)
}
