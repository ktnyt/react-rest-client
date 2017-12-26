import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Endpoints from './Endpoints'

class Endpoint extends Component {
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

    onChange: PropTypes.func,
  }

  static defaultProps = {
    middleware: [],

    options: {},

    noFetchOnMount: false,
    suppressUpdate: false,

    persist: true,

    onChange: () => {},
  }

  render = () => {
    const { component, render, children, ...config } = this.props

    return (
      <Endpoints
        configs={{ props: config }}
        render={({ props }) => component ? (
            React.createElement(component, props)
          ) : render ? (
            render(props)
          ) : children ? (
            typeof children === 'function' ? (
              children(props)
          ) : !Array.isArray(children) || children.length ? (
            React.cloneElement(React.Children.only(children), props)
          ) : null
        ) : null}
      />
    )
  }
}

export default Endpoint