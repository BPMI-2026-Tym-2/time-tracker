import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import groupController from './group.controller.js';
import authMiddleware from '../../shared/auth/require-user.js';

const groupRouter = Router();

groupRouter.delete(
  '/:groupId',
  authMiddleware.requireUser,
  asyncHandler(groupController.deleteGroup),
);

groupRouter.get('/:groupId/members', asyncHandler(groupController.listMembers));

export default groupRouter;
