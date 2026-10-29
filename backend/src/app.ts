import express from 'express';
import { errorHandler } from './shared/errors/error-handler.js';
import { corsMiddleware } from './shared/http/cors.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { userRouter } from './modules/users/user.routes.js';

const app = express();
app.use(corsMiddleware);

app.use('/auth', authRouter);

app.use(express.json());
app.use('/tasks', taskRouter);
app.use('/users', userRouter);

app.use(errorHandler);

export { app };
