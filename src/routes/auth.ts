import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { createHash, randomUUID } from 'crypto';

const router = Router();

const adminUser : User = {
  _id: '5e4b95d863103e001f694335',
  username: 'admin',
  password: createHash('sha256').update('admin').digest('hex'),
  email: 'admin@admin.com',
  todos: []
};
const testUser : User = {
  _id: '5e4b95d863103e001f694336',
  username: 'test',
  password: createHash('sha256').update('test').digest('hex'),
  email: 'test@test.com',
  todos: []
};
let users: User[] = [adminUser, testUser];
export var signedInUsers: Map<string, User> = new Map();


const createToken = (user: User) => {
  return createHash('sha256').update(user._id).digest('hex')// + "#" + Date().toString();
};
export const isSignedIn = (req : Request, res : Response, next : any) => {
  if (signedInUsers.get(req.headers['token'] as string)) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};


const userValidationRules = [
  body('email').isEmail().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password must be at least 8 characters long'),
];

router.post('/signup', userValidationRules, (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userExists = users.some((u) => u.email === req.body.email);
  if(userExists) {
    return res.status(400).json({ errors: [{ msg: 'Email is already in use' }] });
  }

  const user: User = {
    _id: randomUUID(),
    username: req.body.username || req.body.email.split('@')[0],
    password: createHash('sha256').update(req.body.password).digest('hex'),
    email: req.body.email,
    todos: []
  };

  users.push(user);

  res.status(201).json({
    message: 'User created successfully, login to continue',  
  })
});

router.post('/login', (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = users.find((u) => {
    return (u.email === req.body.email) || (u.username === req.body.username)
  });
  if (!user || user.password !== createHash('sha256').update(req.body.password).digest('hex')) {
    res.status(404).json({ message: 'Invalid credentials' });
  } else {
    const token = createToken(user);
    signedInUsers.set(token, user);
    
    res.json({ message: 'Logged in successfully', email : user.email, username : user.username, token });
  }
});
export default router;