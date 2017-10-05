import 'whatwg-fetch'
import { fetchWithMiddleware } from './middleware'

export const buildParams = params => {
  if(!params) return ''
  const keys = Object.keys(params)
  if(keys.length === 0) return ''
  return `?${keys.map(key => `${key}=${params[key]}`).join('&')}`
}

const buildUrl = (base, path, params) => `${base}/${path.join('/')}${buildParams(params)}`

class Handlers {
  constructor(base, path, middleware=[]) {
    this.base = base
    this.path = Array.isArray(path) ? path : [path]
    this.middleware = middleware

    this.browse = this._browse
    this.read = this._read
    this.edit = this._edit
    this.add = this._add
    this.destroy = this._destroy
    this.replace = this._replace
    this.wipe = this._wipe
    this.refresh = () => this.browse()
    this.fetch = fetchWithMiddleware(this.middleware)
  }

  addMiddleware = middleware => {
    this.middleware.push(middleware)
    this.fetch = fetchWithMiddleware(this.middleware)
    return this
  }

  bindParams = params => {
    this.browse = options => this._browse({ ...params, ...options })
    this.wipe = options => this._wipe({ ...params, ...options })
    this.refresh = () => this.browse()
    return this
  }

  bindPrimaryKey = pk => {
    delete this.browse
    delete this.add
    delete this.wipe
    this.read = () => this._read(pk)
    this.edit = body => this._edit(pk, body)
    this.destroy = () => this._destroy(pk)
    this.replace = body => this._replace(pk, body)
    this.refresh = () => this.read()
    return this
  }

  _browse = params => this.fetch(buildUrl(this.base, [...this.path], params))
  _read = pk => this.fetch(buildUrl(this.base, [...this.path, pk]))
  _edit = (pk, body) => this.fetch(buildUrl(this.base, [...this.path, pk]), { method: 'PATCH', body })
  _add = body => this.fetch(buildUrl(this.base, [...this.path]), { method: 'POST', body })
  _destroy = pk => this.fetch(buildUrl(this.base, [...this.path, pk]), { method: 'DELETE' })
  _replace = (pk, body) => this.fetch(buildUrl(this.base, [...this.path, pk]), { method: 'PUT', body })
  _wipe = params => this.fetch(buildUrl(this.base, [...this.path], params), { method: 'DELETE' })
}

export default Handlers
