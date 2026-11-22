import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { requireOrganizationRole } from '../../shared/auth/require-organization-role.js';
import { activityController } from '../activities/activity.controller.js';
import organizationController from './organization.controller.js';

const organizationRouter = Router();

organizationRouter.get('/', asyncHandler(organizationController.listOrganizations));
organizationRouter.post('/', asyncHandler(organizationController.createOrganization));
organizationRouter.post(
  '/:organizationId/invitations',
  asyncHandler(organizationController.createInvitation),
);
organizationRouter.post(
  '/invitations/:invitationId/accept',
  asyncHandler(organizationController.respondToInvitation('accept')),
);
organizationRouter.post(
  '/invitations/:invitationId/reject',
  asyncHandler(organizationController.respondToInvitation('reject')),
);
organizationRouter.get('/:organizationId', asyncHandler(organizationController.getOrganization));
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
organizationRouter.get(
  '/:organizationId/activities',
  requireOrganizationRole('owner', 'member'),
  asyncHandler(activityController.listOrganization),
);
organizationRouter.post(
  '/:organizationId/activities',
  requireOrganizationRole('owner', 'member'),
  asyncHandler(activityController.createOrganization),
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
