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

  if (!user) {
    return response.status(400).json({ message: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ message: "Username already exists" });
  }

  users.push({
    id: uuidv4,
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoOperation = {
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(todoOperation);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id, title, deadline } = request.body;
  const { user } = request;
  
  if (!user.todos[id]) {
    return response.status(404).json({ message: "To do not found" });
  }

  user.todos[id].title = title;
  user.todos[id].deadline = deadline;

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.body;
  const { user } = request;
  
  if (!user.todos[id]) {
    return response.status(404).json({ message: "To do not found" });
  }

  user.todos[id].done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.body;
  const { user } = request;

  if (!user.todos[id]) {
    return response.status(404).json({ message: "To do not found" });
  }

  user.todos.splice(id, 1);

  return response.status(200).json(user.todos);
});

module.exports = app;
