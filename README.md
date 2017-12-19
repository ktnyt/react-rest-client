# react-rest-client
Consuming REST APIs the React way.

## Installation
React Rest Client requires *React 0.15 or later*.


### Using npm
```
npm install --save react-rest-client
```

### Using yarn
```
yarn add react-rest-client
```

## Usage
### The Basics
React Rest Client borrows many ideas from React Router in terms of syntax. Here is an example of consuming a simple Todo backend API.

#### Single Endpoint

```jsx
import React, { Component } from 'react'
import { Client, Endpoint, middleware } from 'react-rest-client'

export const onEnter = fn => event => { if(event.key === 'Enter') fn(event) }

class App extends Component {
  render = () => {
    return (
      <Client base='http://example.com'>
        <Endpoint
          path='todos'
          middleware={[middleware.handleJson()]}
          render={({ response, handlers }) => response ? (
          <div>
            <input type='text' onKeyPress={onEnter(event => {
              handlers.add({ text: event.target.value })
            })} />
            <ul>
              {response.data.map((todo, i) => (
                <li key={i}>
                  <input type='text' placeholder={todo.text} onKeyPress={onEnter(event => {
                    const handler = handlers.bind(todo.uuid)
                    handler.edit({ text: event.target.value })
                    event.target.value = ''
                  })} />
                  <input type='button' onClick={event => handlers.destroy(todo.uuid)}  value='Delete' />
                </li>
              ))}
            </ul>
          </div>
        ) : null} />
      </Client>
    )
  }
}

export default App
```

#### Multiple Endpoints

```jsx
import React, { Component } from 'react'
import { Client, Endpoints, middleware } from 'react-rest-client'

export const onEnter = fn => event => { if(event.key === 'Enter') fn(event) }

class App extends Component {
  render = () => {
    return (
      <Client base='https://example.com'>
        <Endpoint specs={{
          todos: {
            path: 'todos',
            middleware: [middleware.handleJson()],
          }
        }} render={({ todos: { response, handlers } }) => response ? (
          <div>
            <input type='text' onKeyPress={onEnter(event => {
              handlers.add({ text: event.target.value })
            })} />
            <ul>
              {response.data.map((todo, i) => (
                <li key={i}>
                  <input type='text' placeholder={todo.text} onKeyPress={onEnter(event => {
                    const handler = handlers.bind(todo.uuid)
                    handler.edit({ text: event.target.value })
                    event.target.value = ''
                  })} />
                  <input type='button' onClick={event => handlers.destroy(todo.uuid)}  value='Delete' />
                </li>
              ))}
            </ul>
          </div>
        ) : null} />
      </Client>
    )
  }
}

export default App
```
