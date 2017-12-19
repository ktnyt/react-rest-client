/*eslint react/prop-types: 0*/
import expect from 'expect'
import React from 'react'
import { mount } from 'enzyme'

import { mockFetch } from './helpers'

import Client from '../Client'
import Endpoint from '../Endpoint'

describe('Rest', () => {
  describe('Endpoint', () => {
    it('will pass props to a child', () => {
      const item = { 'text': 'foo' }
      const list = [item, item, item]
      const path = 'todos'
      const fetch = global.fetch
      global.fetch = mockFetch(path, item, list)

      const Child = props => {
        expect(props).toHaveProperty('response')
        expect(props).toHaveProperty('handlers')

        return <div />
      }

      mount(
        <Client base='http://localhost:8888'>
          <Endpoint path={path} noFetchOnMount={true} render={Child} />
        </Client>
      )
    })
  })
})
