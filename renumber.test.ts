import { describe, expect, test } from 'bun:test'
import { renumber } from './renumber'

describe('renumber', () => {
  test('should return an empty list on no files', () => {
    expect(renumber([])).toEqual([]);
  })

  test('should disregard files without a number prefix', () => {
    expect(renumber(['a', 'b-b'])).toEqual([{
      oldName: 'b-b',
      newName: 'b-b'
    }, {
      oldName: 'a',
      newName: 'a'
    }]);
  })

  test('should disregard files not starting with a number and followed by a dash', () => {
    expect(renumber(['a1-a', '1a'])).toEqual([{
      oldName: '1a',
      newName: '1a'
    }, {
      oldName: 'a1-a',
      newName: 'a1-a'
    }])
  })

  test('should renumber', () => {
    expect(renumber(['1-x', '2-a', '3-@'])).toEqual([{
      oldName: '3-@',
      newName: '30-@'
    }, {
      oldName: '2-a',
      newName: '20-a'
    }, {
      oldName: '1-x',
      newName: '10-x'
    }])
  })

  test('should include files that are not renamed', () => {
    expect(renumber(['1-x', '20-a'])).toEqual([{
      oldName: '20-a',
      newName: '20-a'
    }, {
      oldName: '1-x',
      newName: '10-x'
    }])
  })

  test('should prepend 0s with 10 files or more', () => {
    const files = Array.from({ length: 10 }, (_, i) => `${i + 1}-something`)
    expect(renumber(files)[9]).toEqual({
      oldName: '1-something',
      newName: '010-something'
    })
  })
})