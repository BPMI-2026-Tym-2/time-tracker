import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import groupController from './group.controller.js';

const groupRouter = Router();

groupRouter.get('/:groupId/members', asyncHandler(groupController.listMembers));
groupRouter.get('/:groupId/settings', asyncHandler(groupController.getSettings));
groupRouter.patch('/:groupId/settings', asyncHandler(groupController.updateSettings));
groupRouter.get('/:groupId', asyncHandler(groupController.getSettings));

export default groupRouter;
