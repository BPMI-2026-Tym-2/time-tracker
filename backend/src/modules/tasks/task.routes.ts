import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { createTaskController, getTaskController } from './task.controller.js';

const taskRouter = Router();

taskRouter.post('/', asyncHandler(createTaskController));
taskRouter.get('/:id', asyncHandler(getTaskController));

export { taskRouter };
