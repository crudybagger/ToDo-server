import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { IToDo, ToDo } from '../models/todo';
import { IUser } from '../models/user';
import { isSignedIn } from './auth';
import { getSignedInUser, getSignedInUserTodos, storeToken, addTodo, updateTodo, deleteTodo } from '../useDB'

const router = Router();

const todoValidationRules = [
  body('task').notEmpty().withMessage('Task is required'),
];

router.get('/', isSignedIn , async (req: Request, res: Response) => {
  res.json(await getSignedInUserTodos(req.headers['token'] as string));
});

router.post('/', todoValidationRules, isSignedIn, async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const currentUser = await getSignedInUser(req.headers['token'] as string) as IUser;
  const todo = new ToDo( {
    task: req.body.task,
    completed: false,
  });
  await todo.save();
  currentUser.todos.push(todo as IToDo);
  currentUser && addTodo(todo as IToDo, currentUser);
  currentUser && storeToken(req.headers['token'] as string, currentUser);
  res.status(201).json(todo)
});

router.post('/update', isSignedIn, async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const currentUser = await getSignedInUser(req.headers['token'] as string) as IUser;
  const todo = currentUser?.todos.find((t) => t._id?.toString() === req.body.todoId);
  if (!todo) {
    res.status(404).json({message : 'Todo not found'});
  }
  await updateTodo({...todo, completed : req.body.completed} as IToDo, currentUser);
  res.json(todo);

});
router.post('/delete/:id', isSignedIn, async (req: Request, res: Response) => {
  const currentUser = await getSignedInUser(req.headers['token'] as string) as IUser;

  const index = currentUser?.todos.findIndex((t) => t._id?.toString() === req.params.id);
  if (index === -1) {
    res.status(404).json({message : 'ToDo not found'});
  } else {
    currentUser?.todos.splice(index || 0, 1);
    currentUser && storeToken(req.headers['token'] as string, currentUser);
    deleteTodo(req.params.id, currentUser);
    return res.json({ message : 'Deleted' });
  }
});
export default router;