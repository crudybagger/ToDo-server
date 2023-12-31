import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { IUser, User } from '../models/user';
import { createHash, randomUUID } from 'crypto';
import { getUserByEmail, storeToken, saveUser, userExists, getSignedInUser } from '../useDB';
const router = Router();

const createToken = (user: IUser) => {
  return createHash('sha256').update(user._id?.toString() || '').digest('hex')// + "#" + Date().toString();
};
export const isSignedIn = async (req : Request, res : Response, next : any) => {
  if (await getSignedInUser(req.headers['token'] as string)) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const userValidationRules = [
  body('email').isEmail().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password must be at least 8 characters long'),
];

router.post('/signup', userValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const DoesUserExist = await userExists(req.body.email);
  if(DoesUserExist) {
    return res.status(400).json({ errors: [{ msg: 'Email is already in use' }] });
  }

  const user: IUser = {
    // _id: randomUUID(),
    username: req.body.username || req.body.email.split('@')[0],
    password: createHash('sha256').update(req.body.password).digest('hex'),
    email: req.body.email,
    todos: []
  };

  await saveUser(user);
  res.status(201).json({
    message: 'IUser created successfully, login to continue',  
  })
});

router.post('/login', async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = await getUserByEmail(req.body.email) as IUser;
  if (!user || user.password !== createHash('sha256').update(req.body.password).digest('hex')) {
    res.status(404).json({ message: 'Invalid credentials' });
  } else {
    const token = storeToken(createToken(user), user)
    res.json({ message: 'Logged in successfully', email : user.email, username : user.username, token });
  }
});
export default router;