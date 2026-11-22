import { z } from 'zod';

const id = z.string().min(1);
const filterId = z.string().trim().min(1);
const filterIds = z
  .union([filterId, z.array(filterId).min(1)])
  .transform((value) => [value].flat());
const dateTime = z.iso.datetime({ offset: true }).pipe(z.coerce.date());

const listQuery = z
  .strictObject({
    from: dateTime.optional(),
    to: dateTime.optional(),
    categoryId: filterIds.optional(),
    tagId: filterIds.optional(),
  })
  .refine(({ from, to }) => !from || !to || from < to, {
    path: ['to'],
    message: 'Konec období musí být po jeho začátku',
  });

const activityResponse = z.object({
  id,
  name: z.string(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  categoryIds: z.array(id),
  tagIds: z.array(id),
});

const listResponse = z.object({
  items: z.array(activityResponse),
  hasActivities: z.boolean(),
});

export const activitySchema = { listQuery, activityResponse, listResponse };

export type ActivityResponse = z.infer<typeof activityResponse>;
export type ListActivitiesQuery = z.infer<typeof listQuery>;
export type ListActivitiesResponse = z.infer<typeof listResponse>;
