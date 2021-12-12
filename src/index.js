const express = require("express");
const cors = require("cors");

const {
  v4: uuidv4
} = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Username does not exists"
    });
  }
  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const {
    user
  } = request;

  const {
    id
  } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo does not exists"
    });
  }

  request.todo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const {
    name,
    username
  } = request.body;

  const userNameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userNameAlreadyExists) {
    return response.status(400).json({
      error: "Username already exists."
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  const {
    title,
    deadline
  } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {
    todo
  } = request;

  const {
    title,
    deadline
  } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {
    todo
  } = request;

  todo.done = true;

  response.status(200).json(todo);
});

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const {
      todo,
      user
    } = request;

    user.todos.splice(user.todos.indexOf(todo), 1);

    return response.status(204).send();
  }
);

app.get("/users", (request, response) => {
  response.status(200).json(users);
});

module.exports = app;
