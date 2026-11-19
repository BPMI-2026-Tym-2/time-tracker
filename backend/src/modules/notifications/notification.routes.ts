import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { notificationController } from './notification.controller.js';

export const notificationRouter = Router();
notificationRouter.get('/', asyncHandler(notificationController.list));
