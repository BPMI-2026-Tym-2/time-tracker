import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { activityController } from '../activities/activity.controller.js';
import userController from './user.controller.js';

export const userRouter = Router();

userRouter.get('/profile', asyncHandler(userController.getProfile));
userRouter.get('/activities', asyncHandler(activityController.listPersonal));
userRouter.delete('/:userId', asyncHandler(userController.deleteUser));
