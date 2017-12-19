/*eslint react/prop-types: 0*/
import expect from 'expect'
import React from 'react'
import { mount } from 'enzyme'

import { mockFetch } from './helpers'

import Client from '../Client'
import Endpoints from '../Endpoints'

describe('Rest', () => {
  describe('Endpoints', () => {
    it('will pass props to a child', () => {
      const item = { 'text': 'foo' }
      const list = [item, item, item]
      const path = 'todos'
      const fetch = global.fetch
      global.fetch = mockFetch(path, item, list)

      const Child = props => {
        expect(props).toHaveProperty(path)

        expect(props[path]).toHaveProperty('response')
        expect(props[path]).toHaveProperty('handlers')

        return <div />
      }

      mount(
        <Client base='http://localhost:8888'>
          <Endpoints configs={{ [path]: { path: path, noFetchOnMount: true } }} render={Child} />
        </Client>
      )
    })
  })
})
