import { expect, test } from 'vitest'
import { condenseItem } from '../src/index.js'

test('condenses item properly', () => {
  const item = {
    _id: 'eeffb1da94a36f830381d17677e04d57',
    picture: { _id: 'eeffb1da94a36f830381d17677e04d58' },
    pictures: [
      {
        _id: 'eeffb1da94a36f830381d17677e04d59',
        name: 'file1.jpg',
      },
      {
        _id: 'eeffb1da94a36f830381d17677e04d60',
        name: 'file2.jpg',
      },
    ],
  }

  const condensedItem = condenseItem(item) as {
    _id: string
    picture: string
    pictures: string[]
  }

  expect(condensedItem._id).toBe(item._id)
  expect(condensedItem.picture).toBe(item.picture._id)
  expect(condensedItem.pictures[0]).toBe(item.pictures[0]._id)
  expect(condensedItem.pictures[1]).toBe(item.pictures[1]._id)
})

