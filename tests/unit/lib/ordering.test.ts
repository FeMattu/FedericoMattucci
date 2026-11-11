import { describe, expect, it } from 'vitest'
import { moveItem, positionsFromOrder, sortByIds } from '@/lib/ordering'

describe('moveItem', () => {
  it('moves forward and backward without mutating the input', () => {
    const input = ['a', 'b', 'c', 'd']
    expect(moveItem(input, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(input, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
    expect(input).toEqual(['a', 'b', 'c', 'd'])
  })

  it('ignores out-of-range indexes', () => {
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
  })
})

describe('positionsFromOrder', () => {
  it('assigns dense positions', () => {
    expect(positionsFromOrder(['x', 'y'])).toEqual([
      { id: 'x', position: 0 },
      { id: 'y', position: 1 },
    ])
  })
})

describe('sortByIds', () => {
  it('follows the given order and appends unknown ids last', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(sortByIds(items, ['c', 'a']).map((i) => i.id)).toEqual(['c', 'a', 'b'])
  })
})
