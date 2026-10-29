import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { getCurrentUserController, getUserByIdController } from './user.controller.js';

const userRouter = Router();

userRouter.get('/me', requireAuth, asyncHandler(getCurrentUserController));
userRouter.get('/:id', requireAuth, asyncHandler(getUserByIdController));

export { userRouter };
