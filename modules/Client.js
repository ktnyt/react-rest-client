import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Client extends Component {
  static propTypes = {
    base: PropTypes.string.isRequired,
    path: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    middleware: PropTypes.array,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    path: [],
    middleware: [],
  }

  static contextTypes = {
    rest: PropTypes.object,
  }

  static childContextTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    const { base, path: propPath, middleware } = this.props

    const path = Array.isArray(propPath) ? propPath : [propPath]

    return {
      rest: {
        ...this.context.rest,
        base,
        path,
        middleware,
      },
    }
  }

  render = () => {
    return React.Children.only(this.props.children)
  }
}

export default Client
