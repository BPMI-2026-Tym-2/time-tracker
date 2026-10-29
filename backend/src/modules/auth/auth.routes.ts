import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.config.js';

const authRouter = Router();

authRouter.all(['/', '/*splat'], toNodeHandler(auth));

export { authRouter };
