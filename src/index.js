const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find(user => user.username === username)
  if (!userAlreadyExists) {
    return response.status(404).json({ error: 'user does not exists' })
  }

  request = { username };

  return next();
}

app.post('/users', async (request, response) => {
  try {
    const { name, username } = request.body;

    const userAlreadyExists = users.find(user => user.username === username)
    if (userAlreadyExists) {
      return response.status(400).json({ error: 'user already exists.' })
    }

    const user = { 
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(user)
  
    return response.status(201).json(user)
  } catch (err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

app.get('/todos', checksExistsUserAccount, async (request, response) => {
  try {
    const { username } = request.headers;

    const user = users.find(user => user.username === username)

    return response.status(200).json(user.todos)
  } catch (err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { username } = request.headers;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    users.forEach((user) => {
      if (user.username === username) {
        user.todos.push(todo)
      }
    })

    return response.status(201).json(todo)

  } catch (err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;
    const { title, deadline } = request.body;

    users.forEach((user) => {
      if (user.username === username) {
        user.todos.forEach((todo) => {
          if (todo.id === id) {
            todo.title = title
            todo.deadline = deadline
          }
        })
      }
    })

    const user = users.find(user => user.username === username)
    const todo = user.todos.find(todo => todo.id === id)
    if (!todo) {
      return response.status(404).json({ error: 'ToDo does not exists.' })
    }

    return response.status(200).json(todo)

  } catch (err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;

    users.forEach((user) => {
      if (user.username === username) {
        user.todos.forEach((todo) => {
          if (todo.id === id) {
            todo.done = true
          }
        })
      }
    })

    const user = users.find(user => user.username === username)
    const todo = user.todos.find(todo => todo.id === id)
    if (!todo) {
      return response.status(404).json({ error: 'ToDo does not exists.' })
    }

    return response.status(200).json(todo)
  } catch (err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.headers;
    const { id } = request.params;

    const user = users.find(user => user.username === username)
    const todo = user.todos.find(todo => todo.id === id)
    if (!todo) {
      return response.status(404).json({ error: 'ToDo does not exists.' })
    }

    users.forEach((user) => {
      if (user.username === username) {
        const index = user.todos.indexOf(id)

        user.todos.splice(index, 1)
      }
    })

    return response.status(204).send()

  } catch(err) {
    // console.error(err.message)
    return response.status(400).json(err.message)
  }
});

module.exports = app;