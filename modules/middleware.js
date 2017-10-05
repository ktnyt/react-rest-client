import { bypass, combine, chain, toProp } from './utils'

export const createMiddleware = (before, after) => ({ before, after })

export const addHeadersMiddleware = headers => createMiddleware(request => {
  if(!request) {
    return { headers }
  }

  if(!request.hasOwnProperty('headers')) {
    return {
      ...request,
      headers,
    }
  }

  return {
    ...request,
    headers: {
      ...request.headers,
      ...headers,
    }
  }
}, o=>o)

export const jsonMiddleware = createMiddleware(request => {
  if(!request.hasOwnProperty('headers')) {
    request.headers = {}
  }

  request.headers['Accept'] = 'application/json'
  request.headers['Content-Type'] = 'application/json; charset=utf-8'

  if(typeof request.body === 'object') {
    request.body = JSON.stringify(request.body)
  }

  return request
}, response => response.json())

export const bypassMiddleware = f => createMiddleware(o=>o, bypass(f))

export const fetchWithMiddleware = middleware => (url, request) => {
  const before = combine(middleware.map(toProp('before')))
  const after = chain(middleware.map(toProp('after')))
  const modded = before(request)
  return after(fetch(url, modded), modded)
}

export default {
  createMiddleware,
  addHeadersMiddleware,
  jsonMiddleware,
  bypassMiddleware,
}
