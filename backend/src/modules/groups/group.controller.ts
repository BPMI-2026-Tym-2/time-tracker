import type { Request, Response } from 'express';
import { createGroupRequestSchema, groupResponseSchema } from '@time-tracker/shared';
import { sendData } from '../../shared/http/response.js';
import { createGroupService } from './group.service.js';
import { toGroupResponse } from './group.mapper.js';

export async function createGroupController(request: Request, response: Response) {
  // 1. Zod validace těla požadavku
  const input = createGroupRequestSchema.parse(request.body);

  // 2. Volání service
  const group = await createGroupService(input);

  // 3. Mapování a validace výstupu
  return sendData(response, groupResponseSchema.parse(toGroupResponse(group)), 201);
}
