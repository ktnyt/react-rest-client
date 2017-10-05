import expect from 'expect'
import { bypass, combine, chain, toProp } from '../utils'

describe('Rest', () => {
  describe('utils.bypass', () => {
    it('should bypass function call', () => {
      const addOne = { exec: i => i + 1 }
      const spy = jest.spyOn(addOne, 'exec')

      expect(bypass(addOne.exec)(42)).toBe(42)
      expect(spy).toHaveBeenCalled()

      spy.mockReset()
      spy.mockRestore()
    })
  })

  describe('utils.combine', () => {
    it('should combine multiple functions', () => {
      const addOne = i => i + 1
      const double = i => i * 2

      expect(combine([addOne, double])(42)).toEqual(86)
      expect(combine([double, addOne])(42)).toEqual(85)
    })
  })

  describe('utils.chain', () => {
    it('should chain multiple functions', () => {
      const addOne = i => i + 1
      const double = i => i * 2
      const p = Promise.resolve(42)

      expect(chain([addOne, double])(p)).resolves.toEqual(86)
      expect(chain([double, addOne])(p)).resolves.toEqual(85)
    })
  })

  describe('utils.toProp', () => {
    it('should return an object property', () => {
      const item = { foo: 'bar' }

      expect(toProp('foo')(item)).toEqual(item.foo)
    })
  })
})
