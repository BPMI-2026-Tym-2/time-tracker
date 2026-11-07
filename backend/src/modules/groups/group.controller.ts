import type { Request, Response } from 'express';
import { sendData } from '../../shared/http/response.js';
import { AppError } from '../../shared/errors/app-error.js';
import groupService from './group.service.js';
import { groupSchema } from '@time-tracker/shared';

export type GroupController = {
  deleteGroup: (request: Request, response: Response) => Promise<void>;
  listMembers: (request: Request, response: Response) => Promise<void>;
  createGroup: (request: Request, response: Response) => Promise<void>;
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

async function deleteGroup(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { groupId } = groupSchema.deleteParams.parse(request.params);
  const result = await groupService.deleteGroup(request.user, groupId);
  sendData(response, groupSchema.deleteResponse.parse(result));
}

async function createGroup(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Not authenticated', 401);
  }

  const input = groupSchema.createGroupRequest.parse(request.body);
  const group = await groupService.createGroup(input);

  sendData(response, groupSchema.createGroupResponse.parse(group), 201);
}

const groupController: GroupController = {
  deleteGroup,
  listMembers,
  createGroup,
};

export default groupController;
