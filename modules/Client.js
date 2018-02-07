import React, { Component } from 'react'
import PropTypes from 'prop-types'

const register = config => {

}

class Client extends Component {
  state = {}

  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  static childPropTypes = {
    rest: PropTypes.object.isRequired,
  }

  getChildContext = () => {
    return {
      rest: {
        handlers: this.handlers,
        response: this.state,
        register,
      },
    }
  }

  render = () => {
    return React.children.only(this.props.children)
  }
}

export default Client
