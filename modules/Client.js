import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Client extends Component {
  static propTypes = {
    base: PropTypes.string.isRequired,
    middleware: PropTypes.array,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    middleware: [],
  }

  static contextTypes = {
    rest: PropTypes.object,
  }

  static childContextTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    const { base, middleware } = this.props

    return {
      rest: {
        ...this.context.rest,
        base,
        path: [],
        middleware,
      },
    }
  }

  render = () => {
    return React.Children.only(this.props.children)
  }
}

export default Client
