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
  onChange: () => {},
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
    middleware: PropTypes.array,

    onChange: PropTypes.func,
  }

  static defaultProps = {
    middleware: [],
    onChange: () => {},
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
    const { base, path: contextPath } = this.context.rest

    const selectPath = (paths, path) => {
      if(path[0] === '/') {
        return [path.slice(1)]
      }
      return [...paths, path]
    }

    const addPk = (paths, pk) => {
      if(pk) {
        return [...paths, pk]
      }
      return paths
    }

    const path = persist ? addPk(selectPath(contextPath, configs[persist].path), configs[persist].pk) : contextPath

    return {
      rest: {
        ...this.context.rest,
        base,
        path,
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

  componentDidUpdate = (prevProps, prevState) => {
    const { configs, onChange } = this.props

    const data = Object.keys(configs).map(name => ({
      [name]: {
        response: this.state[name],
        handlers: this.handlers[name],
      },
    })).reduce((prev, curr) => ({ ...prev, ...curr }))

    Object.keys(data).forEach(name => {
      if (JSON.stringify(this.state[name]) !== JSON.stringify(prevState[name])) {
        fillDefaults(configs[name]).onChange(data[name])
      }
    })

    if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
      onChange(data)
    }
  }

  createHandlers = (props, context) => {
    const {
      configs,
      middleware: propsMiddleware,
    } = this.props

    Object.keys(configs).forEach(name => {
      const {
        pk,
        path: propsPath,
        options,
        middleware: configMiddleware,
        suppressUpdate,
      } = fillDefaults(configs[name])

      const {
        base,
        path: contextPath,
        middleware: contextMiddleware,
      } = context.rest

      const path = propsPath[0] === '/' ? propsPath.slice(1) : [...contextPath, propsPath].join('/')
      const url = `${base}/${path}`

      if(!pk) {
        const update = createMiddleware(request => request, response => {
          if(response.request.type !== METHOD.BROWSE) {
            this.handlers[name].browse()
          } else {
            if(!suppressUpdate) {
              this.setState({ [name]: response })
            }
          }
          return response
        })
  
        const middleware = [...contextMiddleware, ...propsMiddleware, ...configMiddleware, update]
        const altfetch = fetchWithMiddleware(middleware)
        this.handlers[name] = new ListHandler(url, altfetch, options)
      } else {
        const update = createMiddleware(request => request, response => {
          if(response.request.type === METHOD.DESTROY) {
            this.handlers[name].read()
          } else {
            if(!suppressUpdate) {
              this.setState({ [name]: response })
            }
          }
          return response
        })
  
        const middleware = [...contextMiddleware, ...propsMiddleware, ...configMiddleware, update]
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
