export const createMiddleware = (before, after) => ({ before, after })

export const injectHeaders = headers => createMiddleware(request => {
  if(!request) {
    return  { headers }
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
    },
  }
}, response => response)

export const injectJsonHeaders = (onRequest=true, onResponse=true) => request => {
  if(!request) {
    request = {}
  }

  if(!request.hasOwnProperty('headers')) {
    request.headers = {}
  }

  if(onRequest) {
    request.headers['Accept'] = 'application/json'

    if(!!request.body) {
      request.body = JSON.stringify(request.body)
    }
  }

  if(onResponse) {
    request.headers['Content-Type'] = 'application/json; charset=utf-8'
  }

  return request
}

export const parseJsonResponse = (destructive=false) => response => {
  if(destructive) {
    return response.json().catch(() => { return {} })
  }

  const clone = response.clone()

  return clone.json().catch(() => { return {} }).then(data => {
    response.data = data
    return response
  })
}

export const handleJson = (destructive=false) => createMiddleware(injectJsonHeaders(), parseJsonResponse(destructive))

export const fetchWithMiddleware = middleware => (url, request={}) => {
  const before = middleware.map(({ before }) => before)
  const after = middleware.map(({ after }) => after)
  const modded = before.reduce((x, f) => f(x), request)
  const promise = fetch(url, modded).then(response => {
    response.request = modded
    return response
  })

  return after.reduce((p, f) => p.then(f), promise)
}

export default {
  injectHeaders,
  injectJsonHeaders,
  parseJsonResponse,
  handleJson,
  fetchWithMiddleware,
}
