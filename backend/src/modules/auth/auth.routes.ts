import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';
import { auth } from './auth.config.js';

export const authRouter = Router();

authRouter.all('/*splat', toNodeHandler(auth));
