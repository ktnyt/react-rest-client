import React from 'react'
import Client from './Client'
import Endpoint from './Endpoint'
import Endpoints from './Endpoints'
import middleware from './middleware'

const withEndpoint = props => Component => <Endpoint {...props} component={Component} />
const withEndpoints = props => Component => <Endpoints {...props} component={Component} />

export {
  Client,
  Endpoint,
  Endpoints,
  withEndpoint,
  withEndpoints,
  middleware,
}
