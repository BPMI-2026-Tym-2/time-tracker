import type { Request, Response } from 'express';
import {
  listGroupMembersParamsSchema,
  listGroupMembersQuerySchema,
  listGroupMembersResponseSchema,
} from '@time-tracker/shared';
import { AppError } from '../../shared/errors/app-error.js';
import { sendData } from '../../shared/http/response.js';
import { groupService } from './group.service.js';

export async function listGroupMembersController(request: Request, response: Response) {
  if (!request.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { groupId } = listGroupMembersParamsSchema.parse(request.params);
  const query = listGroupMembersQuerySchema.parse(request.query);
  const result = await groupService.listGroupMembers(request.user, groupId, query);

  return sendData(response, listGroupMembersResponseSchema.parse(result));
}
