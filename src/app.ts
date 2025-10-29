import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import healthRouter from './routes/health.route';
import userRouter from './routes/user.route';
import termsRouter from './routes/terms.route';
import initRouter from './routes/init.route';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', userRouter);
app.use('/terms', termsRouter);
app.use('/api/init', initRouter);


app.use(errorHandler);

app.use(express.static(path.join(__dirname, '../public')));
export default app;

