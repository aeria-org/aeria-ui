import { expect, test } from 'vitest'
import { formatValue } from '../src/index.js'

test('formats values correctly', () => {
  expect(formatValue(true, { type: 'boolean' })).toBe('true')
  expect(formatValue(false, { type: 'boolean' })).toBe('false')
  expect(formatValue({
    nested: {
      colors: [
        'blue',
        'red',
        'purple',
      ],
    },
  }, {
    type: 'object',
    properties: {
      nested: {
        type: 'object',
        properties: {
          colors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  })).toBe('blue, red, purple')

  expect(formatValue({
    age: 50,
    name: 'terry',
  }, {
    $ref: 'person',
    indexes: ['name'],
  })).toBe('terry')
})

