import type { Collection } from '@aeriajs/types'

declare global {
  type Collections = Record<any, Collection>
}

