import type { Request, Response } from 'express';
import { organizationSchema } from '@time-tracker/shared';
import { sendData } from '../../shared/http/response.js';
import organizationService from './organization.service.js';
import { AppError } from '../../shared/errors/app-error.js';

async function createInvitation(request: Request, response: Response): Promise<void> {
  const { organizationId } = organizationSchema.organizationParams.parse(request.params);
  const input = organizationSchema.createInvitationRequest.safeParse(request.body);
  if (!input.success) {
    throw new AppError('Zadejte platnou e-mailovou adresu.', 400);
  }
  const invitation = await organizationService.createInvitation(
    request,
    organizationId,
    input.data,
  );
  sendData(response, organizationSchema.invitationResponse.parse(invitation), 201);
}

async function listMembers(request: Request, response: Response): Promise<void> {
  const { organizationId } = organizationSchema.organizationParams.parse(request.params);
  const query = organizationSchema.listMembersQuery.parse(request.query);
  const result = await organizationService.listMembers(request, organizationId, query);

  sendData(response, organizationSchema.listMembersResponse.parse(result));
}

async function createOrganization(request: Request, response: Response): Promise<void> {
  const input = organizationSchema.createOrganizationRequest.parse(request.body);
  const organization = await organizationService.createOrganization(request, input);

  sendData(response, organizationSchema.createOrganizationResponse.parse(organization), 201);
}

async function listOrganizations(request: Request, response: Response): Promise<void> {
  const query = organizationSchema.listOrganizationsQuery.parse(request.query);
  const result = await organizationService.listOrganizations(request, query);

  sendData(response, organizationSchema.listOrganizationsResponse.parse(result));
}

async function getSettings(request: Request, response: Response): Promise<void> {
  const { organizationId } = organizationSchema.organizationParams.parse(request.params);
  const result = await organizationService.getSettings(request, organizationId);

  sendData(response, organizationSchema.organizationSettingsResponse.parse(result));
}

async function updateSettings(request: Request, response: Response): Promise<void> {
  const { organizationId } = organizationSchema.organizationParams.parse(request.params);
  const input = organizationSchema.updateOrganizationSettingsRequest.parse(request.body);
  const result = await organizationService.updateSettings(request, organizationId, input);

  sendData(response, organizationSchema.organizationSettingsResponse.parse(result));
}

async function deleteOrganization(request: Request, response: Response): Promise<void> {
  const { organizationId } = organizationSchema.organizationParams.parse(request.params);
  await organizationService.deleteOrganization(request, organizationId);

  response.status(204).end();
}

const organizationController = {
  createInvitation,
  listMembers,
  createOrganization,
  listOrganizations,
  getSettings,
  updateSettings,
  deleteOrganization,
};

export default organizationController;
