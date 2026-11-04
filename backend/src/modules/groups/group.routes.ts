import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { listGroupMembersController } from './group.controller.js';

const groupRouter = Router();

groupRouter.get('/:groupId/members', asyncHandler(listGroupMembersController));

export { groupRouter };
