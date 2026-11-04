import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import groupController from './group.controller.js';

const groupRouter = Router();

groupRouter.post('/', asyncHandler(groupController.createGroup));
groupRouter.get('/:groupId/members', asyncHandler(groupController.listMembers));

export default groupRouter;
