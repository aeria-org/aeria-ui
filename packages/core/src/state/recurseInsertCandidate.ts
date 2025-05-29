import type { Property, EndpointError } from '@aeriajs/types'
import type { GlobalStateManager } from '@aeria-ui/state-management'
import { Result } from '@aeriajs/types'
import { getReferenceProperty } from '@aeriajs/common'
import { type CollectionStoreItem, useCollectionStore } from './collection.js'

export const recurseInsertCandidate = async (obj: unknown, property: Property | undefined, manager: GlobalStateManager): Promise<Result.Either<EndpointError, unknown>> => {
  if( !property || !obj ) {
    return Result.result(obj)
  }

  if( 'inline' in property && property.inline && obj.constructor === Object && Object.keys(obj).length === 0 ) {
    return Result.result(undefined)
  }

  if( 'properties' in property ) {
    const entries: [string, unknown][] = []
    for( const key in obj as Record<string, unknown> ) {
      const { error, result } = await recurseInsertCandidate((obj as Record<string, unknown>)[key], property.properties[key], manager)
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
    const arr: unknown[] = []
    for( const elem of obj as unknown[] ) {
      if( typeof elem === 'string' ) {
        arr.push(elem)
        continue
      }

      const { error, result } = await recurseInsertCandidate(elem, property.items, manager)
      if( error ) {
        return Result.error(error)
      }

      arr.push(result)
    }
    return Result.result(arr)
  }

  if( 'inline' in property && property.inline ) {
    if( !Object.values(obj).some((value) => value !== undefined && value !== '') ) {
      return Result.result(null)
    }

    const collection = getReferenceProperty(property)!.$ref
    const helperStore = useCollectionStore(collection, manager)

    const { error, result } = await helperStore.$actions.deepInsert({
      what: obj as CollectionStoreItem,
    })

    if( error ) {
      return Result.error(error)
    }

    Object.assign(obj, result)
    return Result.result(result._id)
  }

  return Result.result(obj)
}
