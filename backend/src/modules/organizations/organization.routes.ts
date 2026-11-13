import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import organizationController from './organization.controller.js';

const organizationRouter = Router();

organizationRouter.post('/', asyncHandler(organizationController.createOrganization));
organizationRouter.get(
  '/:organizationId/members',
  asyncHandler(organizationController.listMembers),
);

export default organizationRouter;
