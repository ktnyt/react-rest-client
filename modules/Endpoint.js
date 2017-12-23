import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ListHandler from './ListHandler'
import ItemHandler from './ItemHandler'
import { createMiddleware, fetchWithMiddleware } from './middleware'
import { METHOD } from './types'

class Endpoint extends Component {
  state = { response: false }
  handlers = false

  static propTypes = {
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),

    path: PropTypes.string.isRequired,
    pk: PropTypes.string,
    middleware: PropTypes.array,

    options: PropTypes.object,

    noFetchOnMount: PropTypes.bool,
    suppressUpdate: PropTypes.bool,

    persist: PropTypes.bool,
  }

  static defaultProps = {
    middleware: [],

    options: {},

    noFetchOnMount: false,
    suppressUpdate: false,

    persist: true,
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
    const { path: propsPath, persist } = this.props
    const { base, path: contextPath, middleware } = this.context.rest

    const path = persist ? (
      propsPath[0] === '/' ? (
        [propsPath]
      ) : (
        [...contextPath, propsPath]
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

  componentWillMount = () => {
    this.createHandlers(this.props, this.context)
    if(!this.props.noFetchOnMount) {
      this.handlers.fetch(this.props.options)
    }
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    this.createHandlers(nextProps, nextContext)
    if(!nextProps.noFetchOnMount) {
      this.handlers.fetch(nextProps.options)
    }
  }

  createHandlers = (props, context) => {
    const { pk, path: propsPath, options, middleware: propsMiddleware, suppressUpdate } = props
    const { base, path: contextPath, middleware: contextMiddleware } = context.rest

    const path = propsPath[0] === '/' ? propsPath.slice(1) : [...contextPath, propsPath].join('/')
    const url = `${base}/${path}`

    if(!pk) {
      const update = createMiddleware(request => request, p => p.then(response => {
        if(response.request.type !== METHOD.BROWSE) {
          this.handlers.browse(options)
        } else {
          if(!suppressUpdate) {
            this.setState({ response })
          }
        }
        return response
      }))

      const middleware = [...contextMiddleware, ...propsMiddleware, update]
      const altfetch = fetchWithMiddleware(middleware)
      this.handlers = new ListHandler(url, altfetch)
    } else {
      const update = createMiddleware(request => request, p => p.then(response => {
        if(response.request.type === METHOD.DESTROY) {
          this.handlers.read()
        } else {
          if(!suppressUpdate) {
            this.setState({ response })
          }
        }
        return response
      }))

      const middleware = [...contextMiddleware, ...propsMiddleware, update]
      const altfetch = fetchWithMiddleware(middleware)
      this.handlers = new ItemHandler(url, pk, altfetch)
    }
  }

  render = () => {
    const { component, render, children } = this.props
    const { response } = this.state
    const handlers = this.handlers

    const props = {
      response,
      handlers,
    }

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

export default Endpoint