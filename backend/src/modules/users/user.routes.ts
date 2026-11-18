import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { requireAuth } from '../../shared/auth/require-auth.js';
import userController from './user.controller.js';

export const userRouter = Router();

userRouter.get('/me', requireAuth, asyncHandler(userController.getMe));
