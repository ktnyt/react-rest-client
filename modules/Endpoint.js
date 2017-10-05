import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _ from 'lodash'

import Handlers from './Handlers'
import { createMiddleware, bypassMiddleware } from './middleware'

const joinPath = (pathA, pathB) => Array.isArray(pathB) ? (
  pathB[0][0] === '/' ? pathB : [...pathA, ...pathB]
) : (joinPath(pathA, [pathB]))

class Endpoint extends Component {
  handlers = false
  state = { data: false }

  static propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    pk: PropTypes.string,
    params: PropTypes.object,
    middleware: PropTypes.array,
    noFetchOnMount: PropTypes.bool,
    suppressUpdate: PropTypes.bool,
    persist: PropTypes.bool,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
  }

  static defaultProps = {
    pk: '',
    params: {},
    middleware: [],
    noFetchOnMount: false,
    suppressUpdate: false,
    persist: true,
  }

  static contextTypes = {
    rest: PropTypes.shape({
      base: PropTypes.string.isRequired,
      path: PropTypes.array.isRequired,
      headers: PropTypes.object,
    }),
  }

  static childContextTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    const { path: propsPath, middleware: propsMiddleware, persist } = this.props
    const { base, path: contextPath, middleware: contextMiddleware } = this.context

    const path = persist ? joinPath(contextPath, propsPath) : contextPath
    const middleware = persist ? [...contextMiddleware, ...propsMiddleware] : contextMiddleware

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
      this.handlers.refresh()
    }
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    if(!_.isEqual(this.context.rest, nextContext.rest) || !_.isEqual(this.props, nextProps)) {
      this.createHandlers(nextProps, nextContext)

      if(!this.props.suppressUpdate && !nextProps.suppressUpdate) {
        this.handlers.refresh()
      }
    }
  }

  setData = data => this.setState({ data })

  createHandlers = (props, context) => {
    const { path: propsPath, pk, params, middleware: propsMiddleware } = props
    const { base, path: contextPath, middleware: contextMiddleware } = context

    const path = joinPath(contextPath, propsPath)
    const middleware = [...contextMiddleware, propsMiddleware]
    const handlers = new Handlers(base, path, middleware).bindParams(params)

    if(pk.length) {
      handlers.bindPrimarykey(pk)
      handlers.addMiddleware(bypassMiddleware(this.updateData(name)))
    } else {
      const refreshMiddleware = createMiddleware(o=>o, (response, request) => {
        if(request.hasOwnProperty('method') && request.method !== 'GET') {
          handlers.browse().then(this.setData)
        } else {
          this.setData(response)
        }
      })

      handlers.addMiddleware(refreshMiddleware)
    }

    this.handlers = handlers
  }

  render = () => {
    const { name, component, render, children } = this.props
    const { data } = this.state
    const handlers = this.handlers

    const props = {
      [name]: {
        data,
        handlers,
      }
    }

    return (
      component ? (
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
    )
  }
}

export default Endpoint
