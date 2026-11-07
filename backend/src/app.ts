import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './modules/auth/auth.config.js';
import { prisma } from './db/prisma.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { corsMiddleware } from './shared/http/cors.js';
import { authRouter } from './modules/auth/auth.routes.js';
import groupRouter from './modules/groups/group.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { userRouter } from './modules/users/user.routes.js';

const app = express();
app.use(corsMiddleware);
app.use('/auth', authRouter);
app.use(express.json());

// Autentizační session middleware: ověří Better Auth session a serverově určí roli uživatele
app.use(async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      let role = (session.user as { role?: string }).role;
      if (!role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        role = dbUser?.role ?? 'user';
      }

      req.user = {
        id: session.user.id,
        role: role || 'user',
      };
    } else if (process.env.NODE_ENV === 'development' && !process.env.CI) {
      // V lokálním dev režimu (pro pohodlné zkoušení v prohlížeči)
      req.user = {
        id: 'user-jan-id',
        role: 'user',
      };
    }
  } catch {
    if (process.env.NODE_ENV === 'development' && !process.env.CI) {
      req.user = {
        id: 'user-jan-id',
        role: 'user',
      };
    }
  }
  next();
});

app.use('/groups', groupRouter);
app.use('/tasks', taskRouter);
app.use('/users', userRouter);
app.use(errorHandler);

export { app };
