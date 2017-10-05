/*eslint react/prop-types: 0*/
import expect from 'expect'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { shallow, mount } from 'enzyme'

import Client from '../Client'

class Child extends Component {
  static contextTypes = {
    rest: PropTypes.object.isRequired,
  }

  render = () => {
    return <div />
  }
}

describe('Rest', () => {
  describe('Client', () => {
    it('should enforce a single child', () => {
      // Ignore propTypes warnings
      const propTypes = Client.propTypes
      Client.propTypes = {}

      try {
        expect(() => shallow(
          <Client base={'http://localhost:8888'}>
            <div />
          </Client>
        )).not.toThrow()

        expect(() => shallow(
          <Client base={'http://localhost:8888'}>
          </Client>
        )).toThrow(/a single React element child/)

        expect(() => shallow(
          <Client base={'http://localhost:8888'}>
            <div />
            <div />
          </Client>
        )).toThrow(/a single React element child/)
      } finally {
        Client.propTypes = propTypes
      }
    })

    it('should add client information to the child context', () => {
      const spy = jest.spyOn(console, 'error')

      const rest = {
        base: 'http://localhost:8888',
        path: [],
        middleware: [],
      }

      const wrapper = mount(
        <Client base={rest.base}>
          <Child />
        </Client>
      )

      expect(spy).not.toHaveBeenCalled()

      spy.mockReset()
      spy.mockRestore()

      const child = wrapper.find(Child).getNode()
      expect(child.context.rest).toEqual(rest)
    })
  })
})
