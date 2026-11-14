import type { Request, Response } from 'express';
import { organizationSchema } from '@time-tracker/shared';
import { sendData } from '../../shared/http/response.js';
import organizationService from './organization.service.js';

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

const organizationController = {
  listMembers,
  createOrganization,
};

export default organizationController;
