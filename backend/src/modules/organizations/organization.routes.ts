import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import organizationController from './organization.controller.js';

const organizationRouter = Router();

organizationRouter.get('/', asyncHandler(organizationController.listOrganizations));
organizationRouter.post('/', asyncHandler(organizationController.createOrganization));
organizationRouter.post(
  '/:organizationId/invitations',
  asyncHandler(organizationController.createInvitation),
);
organizationRouter.delete(
  '/:organizationId',
  asyncHandler(organizationController.deleteOrganization),
);
organizationRouter.get(
  '/:organizationId/members',
  asyncHandler(organizationController.listMembers),
);
organizationRouter.get(
  '/:organizationId/settings',
  asyncHandler(organizationController.getSettings),
);
organizationRouter.patch(
  '/:organizationId/settings',
  asyncHandler(organizationController.updateSettings),
);

export default organizationRouter;
