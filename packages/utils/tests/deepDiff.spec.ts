import { expect, test } from 'vitest'
import { deepDiff } from '../src/index.js'

test('diffs two objects deeply', () => {
  const oldObj = {
    name: 'terry',
    age: 44,
  }

  const newObj = {
    name: 'terry',
    age: 45,
  }

  const diff = deepDiff(oldObj, newObj)

  expect(deepDiff(oldObj, oldObj)).toStrictEqual({})
  expect(diff).toStrictEqual({
    age: 45,
  })
})

