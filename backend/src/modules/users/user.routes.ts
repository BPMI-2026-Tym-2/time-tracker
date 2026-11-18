import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import userController from './user.controller.js';

export const userRouter = Router();

userRouter.delete('/:userId', asyncHandler(userController.deleteUser));
