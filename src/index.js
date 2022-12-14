const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user)
    return response
      .status(404)
      .json({ error: "Could not find a user with this username!" });
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists)
    return response
      .status(400)
      .json({ error: "This cpf is already registered in the system!" });
  const user = { name, username, todos: [], id: uuidv4() };
  users.push(user);
  response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
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

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo)
    return response
      .status(404)
      .json({ error: "There is no such whole with this id!" });
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo)
    return response
      .status(404)
      .json({ error: "There is no such whole with this id!" });
  todo.done = !todo.done;
  response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo)
    return response
      .status(404)
      .json({ error: "There is no such whole with this id!" });
  user.todos.splice(todo, 1);
  response.status(204).send();
});

module.exports = app;
