import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth.js';

const authRouter = Router();
const authHandler = toNodeHandler(auth);

authRouter.post('/sign-up/email', authHandler);
authRouter.post('/sign-in/email', authHandler);
authRouter.post('/sign-in/social', authHandler);
authRouter.all('/callback/:id', authHandler);
authRouter.post('/one-tap/callback', authHandler);
authRouter.all('/get-session', authHandler);
authRouter.post('/sign-out', authHandler);

export default authRouter;
