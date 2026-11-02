import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { createGroupController } from './group.controller.js';

const groupRouter = Router();

groupRouter.post('/', asyncHandler(createGroupController));

export { groupRouter };
