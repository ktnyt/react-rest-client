import { METHOD } from './types'

class ItemHandler {
  constructor(url, pk, fetch) {
    this.url = url
    this.pk = pk
    this._fetch = fetch
  }

  call = (request, type) => this._fetch(`${this.url}/${this.pk}`, { ...request, type })

  read    = ()     => this.call(METHOD.READ)
  edit    = (body) => this.call({ method: 'PATCH', body }, METHOD.EDIT   )
  destroy = ()     => this.call({ method: 'DELETE'      }, METHOD.DESTROY)
  replace = (body) => this.call({ method: 'PUT',   body }, METHOD.REPLACE)

  fetch = () => this.read()
}

export default ItemHandler
