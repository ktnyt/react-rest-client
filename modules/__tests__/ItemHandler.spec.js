import ItemHandler from '../ItemHandler'
import { handleJson, fetchWithMiddleware } from '../middleware'
import { mockFetch } from './helpers'

describe('Rest', () => {
  describe('Handlers', () => {
    it('will properly invoke fetch', () => {
      const item = { 'text': 'foo' }
      const list = [item, item, item]
      const path = 'todos'
      const fetch = global.fetch
      global.fetch = mockFetch(path, item, list)

      const altfetch = fetchWithMiddleware([handleJson(true)])
      const handlers = new ItemHandler(path, 'pk', altfetch)

      expect(handlers.read()).resolves.toEqual(item)
      expect(handlers.edit(item)).resolves.toEqual(item)
      expect(handlers.destroy()).resolves.toEqual(item)
      expect(handlers.replace(item)).resolves.toEqual(item)

      global.fetch = fetch
    })
  })
})
