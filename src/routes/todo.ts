import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ToDo } from '../models/todo';
import { randomUUID } from 'crypto';
import { isSignedIn, signedInUsers } from './auth';

const router = Router();

const todoValidationRules = [
  body('task').notEmpty().withMessage('Task is required'),
];

router.get('/', isSignedIn , (req: Request, res: Response) => {
  const currentUser = signedInUsers.get(req.headers['token'] as string);
  res.json(currentUser?.todos);
});

router.post('/', todoValidationRules, isSignedIn, (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const currentUser = signedInUsers.get(req.headers['token'] as string);

   const todo: ToDo = {
    _id: randomUUID(),
    task: req.body.task,
    completed: false,
  };
  currentUser?.todos.push(todo);
  currentUser && signedInUsers.set(req.headers['token'] as string, currentUser);
  res.status(201).json(todo)
});

router.post('/update', isSignedIn, (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const currentUser = signedInUsers.get(req.headers['token'] as string);
  const todo = currentUser?.todos.find((t) => t._id === req.body.todoId);

  if (!todo) {
    res.status(404).json({message : 'Todo not found'});
  } else {
    todo.task = req.body.task || todo.task;
    todo.completed = req.body.completed || todo.completed;

    res.json(todo);
  }

});
router.post('/delete/:id', isSignedIn, (req: Request, res: Response) => {
  const currentUser = signedInUsers.get(req.headers['token'] as string);

  const index = currentUser?.todos.findIndex((t) => t._id === req.params.id);
  if (index === -1) {
    res.status(404).json({message : 'ToDo not found'});
  } else {
    currentUser?.todos.splice(index || 0, 1);
    currentUser && signedInUsers.set(req.headers['token'] as string, currentUser);

    return res.json({ message : 'Deleted' });
  }
});
export default router;