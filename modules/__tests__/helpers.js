import 'whatwg-fetch'

export const mockResponse = body => new Response(body, { status: 200, statusText: 'Ok' })
export const mockJsonResponse = body => mockResponse(JSON.stringify(body))

describe('Rest', () => {
  describe('helper', () => {
    describe('mockResponse', () => {
      it('creates a response without error', () => {
        mockJsonResponse('Hello, world!')
      })
    })

    describe('mockJsonResponse', () => {
      it('creates a json response without error', () => {
        mockJsonResponse({ foo: 'foo', bar: 'bar' })
      })
    })
  })
})

export const mockFetch = (path, item, list) => (url, options={}) => {
  switch(options.method) {
  case 'POST':
  case 'PATCH':
  case 'PUT':
    return Promise.resolve(mockResponse(options.body))
  case 'DELETE':
  default:
    return Promise.resolve(mockJsonResponse(url.endsWith(path) ? list : item))
  }
}
