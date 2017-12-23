import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ListHandler from './ListHandler'
import ItemHandler from './ItemHandler'
import { createMiddleware, fetchWithMiddleware } from './middleware'
import { METHOD } from './types'

const fillDefaults = object => ({
  middleware: [],
  options: {},
  noFetchOnMount: false,
  suppressUpdate: false,
  ...object,
})

class Endpoints extends Component {
  handlers = {}

  static propTypes = {
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),

    configs: PropTypes.object.isRequired,
    persist: PropTypes.string,
  }

  static contextTypes = {
    rest: PropTypes.shape({
      base: PropTypes.string.isRequired,
      path: PropTypes.array.isRequired,
      middleware: PropTypes.array.isRequired,
    }),
  }

  static childContextTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    const { configs, persist } = this.props
    const { base, path: contextPath, middleware } = this.context.rest

    const path = persist ? (
      configs[persist].path[0] === '/' ? (
        [configs[persist].path]
      ) : (
        [...contextPath, configs[persist].path]
      )
    ) : (
      contextPath
    )

    return {
      rest: {
        ...this.context.rest,
        base,
        path,
        middleware,
      }
    }
  }

  constructor(props, context) {
    super(props, context)
    this.state = Object.keys(props.configs).map(name => ({
      [name]: false,
    })).reduce((prev, curr) => ({ ...prev, ...curr }))
  }

  componentWillMount = () => {
    this.createHandlers(this.props, this.context)
    Object.keys(this.props.configs).forEach(name => {
      if(!this.props.configs[name].noFetchOnMount) {
        this.handlers[name].fetch(this.props.options)
      }
    })
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    this.createHandlers(nextProps, nextContext)
    Object.keys(nextProps.configs).forEach(name => {
      if(!nextProps.configs[name].noFetchOnMount) {
        this.handlers[name].fetch(nextProps.options)
      }
    })
  }

  createHandlers = (props, context) => {
    const { configs } = this.props

    Object.keys(configs).forEach(name => {
      const { pk, path: propsPath, options, middleware: propsMiddleware, suppressUpdate } = fillDefaults(configs[name])
      const { base, path: contextPath, middleware: contextMiddleware } = context.rest

      const path = propsPath[0] === '/' ? propsPath.slice(1) : [...contextPath, propsPath].join('/')
      const url = `${base}/${path}`

      if(!pk) {
        const update = createMiddleware(request => request, p => p.then(response => {
          if(response.request.type !== METHOD.BROWSE) {
            this.handlers[name].browse(options)
          } else {
            if(!suppressUpdate) {
              this.setState({ [name]: response })
            }
          }
          return response
        }))
  
        const middleware = [...contextMiddleware, ...propsMiddleware, update]
        const altfetch = fetchWithMiddleware(middleware)
        this.handlers[name] = new ListHandler(url, altfetch)
      } else {
        const update = createMiddleware(request => request, p => p.then(response => {
          if(response.request.type === METHOD.DESTROY) {
            this.handlers[name].read()
          } else {
            if(!suppressUpdate) {
              this.setState({ [name]: response })
            }
          }
          return response
        }))
  
        const middleware = [...contextMiddleware, ...propsMiddleware, update]
        const altfetch = fetchWithMiddleware(middleware)
        this.handlers[name] = new ItemHandler(url, pk, altfetch)
      }
    })
  }

  render = () => {
    const { component, render, children, configs } = this.props
    const props = Object.keys(configs).map(name => ({
      [name]: {
        response: this.state[name],
        handlers: this.handlers[name],
      },
    })).reduce((prev, curr) => ({ ...prev, ...curr }))

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
}

export default Endpoints
