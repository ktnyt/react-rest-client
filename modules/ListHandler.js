import ItemHandler from './ItemHandler'
import { METHOD } from './types'

class ListHandler {
  params = {}
  
  constructor(url, fetch, params) {
    this.url = url
    this._fetch = fetch
    this.params = params
  }

  buildParams = options => {
    const params = { ...this.params, ...options }

    if(!params || Object.keys(params).length === 0) {
      return ''
    }
  
    const search = new URLSearchParams(params)
    return `?${search.toString()}`
  }

  call = (url, request, type) => this._fetch(url, { ...request, type })

  browse  = (options)  => this.call(`${this.url}${this.buildParams(options)}`, {},  METHOD.BROWSE )
  read    = (pk)       => this.call(`${this.url}/${pk}`, {},                        METHOD.READ   )
  edit    = (pk, body) => this.call(`${this.url}/${pk}`, { method: 'PATCH', body }, METHOD.EDIT   )
  add     = (body)     => this.call(`${this.url}`,       { method: 'POST',  body }, METHOD.ADD    )
  destroy = (pk)       => this.call(`${this.url}/${pk}`, { method: 'DELETE'      }, METHOD.DESTROY)
  replace = (pk, body) => this.call(`${this.url}/${pk}`, { method: 'PUT',   body }, METHOD.REPLACE)
  wipe    = (options)  => this.call(`${this.url}${this.buildParams(options)}`, { method: 'DELETE' }, METHOD.WIPE)

  fetch = (options) => this.browse()

  bind = pk => new ItemHandler(this.url, pk, this._fetch)
}

export default ListHandler
