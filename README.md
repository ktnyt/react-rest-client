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

```
import { Client, Endpoint } from 'react-rest-client'

<Client base='http://example.com'>
  <div>
    <h1>Todo App</h1>
      <Endpoint name='todos' path='todos' render={({ todos }) => todos ? (
          <ul>
            {todos.map((todo, index) => (
              <li key={index}>{todo}</li>
            ))}
          </ul>
      ) : null} />
  </div>
</Client>
```
