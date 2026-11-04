import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import groupService from './group.service.js';
import { groupSchema } from '@time-tracker/shared';

export type GroupController = {
  listMembers: (request: Request, response: Response) => Promise<void>;
};

async function listMembers(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { groupId } = groupSchema.listMembersParams.parse(request.params);
  const query = groupSchema.listMembersQuery.parse(request.query);
  const result = await groupService.listMembers(request.user, groupId, query);

  sendData(response, groupSchema.listMembersResponse.parse(result));
}

const groupController: GroupController = {
  listMembers,
  // dalsi metody kontroleru
};

export default groupController;
