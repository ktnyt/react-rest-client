import expect from 'expect'
import { createMiddleware, handleJson } from '../middleware'
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

  describe('handleJson', () => {
    it('should add JSON handling to request and response', () => {
      const sampleJson = { foo: 'foo', bar: 'bar' }
      const jsonResponse = mockJsonResponse(sampleJson)

      const request = handleJson(true).before({ headers: {}, body: sampleJson })

      expect(request).toEqual({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(sampleJson)
      })

      const response = handleJson(true).after(jsonResponse)

      expect(response).resolves.toEqual(sampleJson)
    })
  })
})
