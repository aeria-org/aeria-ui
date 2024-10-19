import type { Property } from '@aeriajs/types'
import { expect, test } from 'vitest'
import { isDocumentComplete } from '../src/index.js'

test('gets whether document is complete correctly', () => {
  const properties: Record<string, Property> = {
    name: { type: 'string' },
    nested: {
      type: 'object',
      properties: { job: { type: 'string' } },
    },
  }

  expect(isDocumentComplete({}, properties)).toBeFalsy()

  // TODO: should check nested objects
  expect(isDocumentComplete({
    name: 'terry',
    nested: {},
  }, properties)).toBeTruthy()
})

