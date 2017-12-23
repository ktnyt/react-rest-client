import ItemHandler from './ItemHandler'
import { METHOD } from './types'

const kvMap = object => object.keys().map(key => ({ key, value: object[key] }))

class ListHandler {
  params = {}
  
  constructor(url, fetch) {
    this.url = url
    this._fetch = fetch
  }

  buildParams = options => {
    const params = { ...this.params, ...options }

    if(!params || Object.keys(params).length === 0) {
      return ''
    }
  
    const pairs = kvMap(params).map(({ key, value }) => `${key}=${value}`)
    return `?${pairs.join('&')}`
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
