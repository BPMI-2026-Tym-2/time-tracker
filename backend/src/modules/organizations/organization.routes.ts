import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { requireOrganizationRole } from '../../shared/auth/require-organization-role.js';
import organizationController from './organization.controller.js';

const organizationRouter = Router();

organizationRouter.post('/', asyncHandler(organizationController.createOrganization));
organizationRouter.post(
  '/:organizationId/invitations',
  asyncHandler(organizationController.createInvitation),
);
organizationRouter.delete(
  '/:organizationId',
  requireOrganizationRole('owner'),
  asyncHandler(organizationController.deleteOrganization),
);
organizationRouter.get(
  '/:organizationId/members',
  requireOrganizationRole('owner', 'member'),
  asyncHandler(organizationController.listMembers),
);

export default organizationRouter;
