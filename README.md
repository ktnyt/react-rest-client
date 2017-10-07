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
React Rest Client borrows many ideas from React Router in terms of syntax. Here is aa example of consuming a simple Todo backend API.

```jsx
import { Client, Endpoint } from 'react-rest-client'

<Client base='http://localhost:8888' middleware={[middleware.jsonMiddleware]}>
  <Endpoints configs={{
      todos: { path: 'ktnyt' }
    }} render={({ todos }) => todos.data ? (
      <div>
        <input type='text' onKeyPress={onEnter(event => {
            todos.handlers.add({ text: event.target.value })
          })} />
        <ul>
          {todos.data.map((todo, i) => (
            <li key={i}>
              {todo.text}
              <input type='button' onClick={event => todos.handlers.destroy(todo.uuid)} value='Delete' />
            </li>
          ))}
        </ul>
      </div>
    ) : null} />
  </div>
</Client>
```
