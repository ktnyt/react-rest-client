import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _ from 'lodash'

import Handlers from './Handlers'
import { createMiddleware, bypassMiddleware } from './middleware'
import { toProp } from './utils'

const defaultConfig = {
  pk: '',
  params: {},
  middleware: [],
  noFetchOnMount: false,
  suppressUpdate: false,
  persist: false,
}

const joinPath = (pathA, pathB) => Array.isArray(pathB) ? (
  pathB[0][0] === '/' ? pathB : [...pathA, ...pathB]
) : (joinPath(pathA, [pathB]))

class Endpoints extends Component {
  handlers = {}

  static propTypes = {
    configs: PropTypes.object.isRequired,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
  }

  static contextTypes = {
    rest: PropTypes.shape({
      base: PropTypes.string.isRequired,
      path: PropTypes.array.isRequired,
      headers: PropTypes.object,
    })
  }

  static childContextTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    const { configs } = this.props
    const { base, path: contextPath, middleware: contextMiddleware } = this.context

    const persist = Object.keys(configs).map(config => ({ ...defaultConfig, ...config })).find(toProp('persist'))

    const path = persist ? joinPath(contextPath, persist.path) : contextPath
    const middleware = persist ? [...contextMiddleware, ...persist.middleware] : contextMiddleware
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

    const { configs } = this.props
    const names = Object.keys(configs)
    const state = {}
    for(const name of names) {
      state[name] = false
    }

    this.state = state
  }

  componentWillMount = () => {
    const { configs } = this.props
    const { rest } = this.context

    this.createHandlers(configs, rest)

    for(const name of Object.keys(configs)) {
      if(!configs[name].noFetchOnMount) {
        this.handlers[name].refresh()
      }
    }
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    if(!_.isEqual(this.context.rest, nextContext.rest) || !_.isEqual(this.props.configs, nextProps.configs)) {
      const { configs } = nextProps
      const { rest } = nextContext

      this.createHandlers(configs, rest)

      for(const name of Object.keys(configs)) {
        if(!configs[name].suppressUpdate) {
          this.handlers[name].refresh()
        }
      }
    }
  }

  updateData = name => nextData => {
    const currData = this.state.data
    const data = { ...currData, nextData }
    this.setData(name)(data)
  }

  setData = name => data => this.setState({ [name]: data })

  createHandlers = (configs, rest) => {
    const { base, path: contextPath, middleware: contextMiddleware } = rest

    for(const name of Object.keys(configs)) {
      const {
        path: configPath,
        pk,
        params,
        middleware: configMiddleware,
      } = { ...defaultConfig, ...configs[name] }

      const path = joinPath(contextPath, configPath)
      const middleware = [...contextMiddleware, ...configMiddleware]
      const handlers = new Handlers(base, path, middleware).bindParams(params)

      if(pk.length) {
        handlers.bindPrimaryKey(pk)
        handlers.addMiddleware(bypassMiddleware(this.updateData(name)))
      } else {
        const refreshMiddleware = createMiddleware(o=>o, (response, request) => {
          if(request.hasOwnProperty('method') && request.method !== 'GET') {
            handlers.browse().then(this.setData(name))
          } else {
            this.setData(name)(response)
          }

          return response
        })

        handlers.addMiddleware(refreshMiddleware)
      }

      this.handlers[name] = handlers
    }
  }

  render = () => {
    const { component, render, children } = this.props
    const props = {}

    const names = Object.keys(this.state)

    for(const name of names) {
      const data = this.state[name]
      const handlers = this.handlers[name]
      props[name] = { data, handlers }
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

export default Endpoints
