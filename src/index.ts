import express, { Request, Response } from 'express';
import todoRoutes from './routes/todo';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use('/todo', todoRoutes);
app.use('/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 