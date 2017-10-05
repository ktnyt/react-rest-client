/*eslint react/prop-types: 0*/
import expect from 'expect'
import React from 'react'
import { mount } from 'enzyme'

import Client from '../Client'
import Endpoints from '../Endpoints'

describe('Rest', () => {
  describe('Endpoints', () => {
    it('will pass props to a child', () => {
      const Child = props => {
        expect(props).toHaveProperty('todos')

        const { todos } = props

        expect(todos).toHaveProperty('data')
        expect(todos).toHaveProperty('handlers')

        return <div />
      }

      mount(
        <Client base='http://localhost:8888'>
          <Endpoints configs={{ todos: { path: 'todos', noFetchOnMount: true } }} render={Child} />
        </Client>
      )
    })
  })
})
