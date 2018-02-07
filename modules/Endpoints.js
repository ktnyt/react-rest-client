import React from 'react'
import PropTypes from 'prop-types'

const Endpoints = ({
  component,
  render,
  children,

  configs,
}, { rest }) => {
  const props = Object.keys(configs).map(key => {
    const config = configs[key]
    const url = config.buildURL()

    if(!rest.manager.registered(config)) {
      rest.manager.register(config)
      return {
        [key]: {
          response: null,
          handlers: rest.manager.handlers[url],
        }
      }
    }

    return {
      [key]: {
        response: rest.responses[url],
        handlers: rest.manager.handlers[url],
      }
    }
  }).reduce((prev, curr) => ({ ...prev, ...curr }))

  return component ? (
    React.createElement(component, props)
  ) : render ? (
    render(props)
  ) : children ? (
    typeof children === 'function' ? (
      children(props)
    ) : !Array.isArray(children) || children.length ? (
      React.cloneElement(React.Children.only(children), props)
    ) : null
  ) : null
}

Endpoints.contextTypes = {
  rest: PropTypes.object.isRequired,
}

export default Endpoints
