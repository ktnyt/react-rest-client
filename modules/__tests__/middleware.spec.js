import expect from 'expect'
import { createMiddleware, jsonMiddleware, bypassMiddleware } from '../middleware'
import { mockJsonResponse } from './helpers'

describe('Rest', () => {
  describe('createMiddleware', () => {
    it('should create a middleware object', () => {
      const before = i => i + 1
      const after = i => i - 1
      const middleware = createMiddleware(before, after)

      expect(middleware).toEqual({ before, after })
    })
  })

  describe('jsonMiddleware', () => {
    it('should add JSON handling to request and response', () => {
      const sampleJson = { foo: 'foo', bar: 'bar' }
      const jsonResponse = mockJsonResponse(sampleJson)

      const request = jsonMiddleware.before({ headers: {}, body: sampleJson })

      expect(request).toEqual({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(sampleJson)
      })

      const response = jsonMiddleware.after(jsonResponse)

      expect(response).resolves.toEqual(sampleJson)
    })
  })

  describe('bypassMiddleware', () => {
    it('should bypass a given function on response', () => {
      const addOne = { exec: i => i + 1 }
      const bypass = bypassMiddleware(i => addOne.exec(i)).after

      const spy = jest.spyOn(addOne, 'exec')

      expect(bypass(42)).toBe(42)
      expect(spy).toHaveBeenCalled()

      spy.mockReset()
      spy.mockRestore()
    })
  })
})
