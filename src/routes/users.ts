import { Router } from 'express';
import { listUsers, getUserById } from '../repo/users';

export const usersRouter = Router();

// GET /users - list all users (no password)
usersRouter.get('/users', (req, res) => {
  const users = listUsers();
  res.json({ items: users });
});

// GET /users/:id - get user by id (no password)
usersRouter.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ code: 400, message: 'Invalid user id' });
  }
  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ code: 404, message: 'User not found' });
  }
  res.json(user);
});
