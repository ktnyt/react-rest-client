import Handlers from '../Handlers'
import { addHeadersMiddleware, jsonMiddleware } from '../middleware'
import { mockFetch } from './helpers'

describe('Rest', () => {
  describe('Handlers', () => {
    it('will properly invoke fetch', () => {
      const item = { 'text': 'foo' }
      const list = [item, item, item]

      const path = 'todos'

      const handlers = new Handlers('', 'todos', [addHeadersMiddleware({}), jsonMiddleware])

      const fetch = global.fetch
      global.fetch = mockFetch(path, item, list)

      expect(handlers.browse()).resolves.toEqual(list)
      expect(handlers.read('foo')).resolves.toEqual(item)
      expect(handlers.edit('foo', item)).resolves.toEqual(item)
      expect(handlers.add(item)).resolves.toEqual(item)
      expect(handlers.destroy('foo')).resolves.toEqual(item)
      expect(handlers.replace('foo', item)).resolves.toEqual(item)
      expect(handlers.wipe()).resolves.toEqual(list)

      global.fetch = fetch
    })
  })
})
