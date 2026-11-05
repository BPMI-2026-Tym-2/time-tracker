import express from 'express';
import { errorHandler } from './shared/errors/error-handler.js';
import { corsMiddleware } from './shared/http/cors.js';
import { authRouter } from './modules/auth/auth.routes.js';
import groupRouter from './modules/groups/group.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { userRouter } from './modules/users/user.routes.js';

const app = express();
app.use(express.json());
app.use(corsMiddleware);

// Auth middleware pro lokální vývoj
app.use((req, _res, next) => {
  const isAnonymous = req.headers['x-anonymous'] === 'true' || req.headers['x-user-id'] === 'none';

  if (isAnonymous) {
    next();
    return;
  }

  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];

  const id =
    typeof headerUserId === 'string' && headerUserId.trim() !== '' ? headerUserId : 'dev-user-id';

  const role =
    typeof headerUserRole === 'string' && headerUserRole.trim() !== '' ? headerUserRole : 'owner';

  req.user = { id, role };
  next();
});

app.use('/auth', authRouter);
app.use('/groups', groupRouter);
app.use('/tasks', taskRouter);
app.use('/users', userRouter);
app.use(errorHandler);

export { app };
