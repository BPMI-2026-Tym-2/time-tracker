import { z } from 'zod';

const activityDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Prague',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function activityCalendarDate(date = new Date()) {
  return activityDateFormatter.format(date);
}

export const pastActivityDateMessage = 'Aktivity nelze vytvářet do minulosti.';

const id = z.string().min(1);
const filterIds = z.union([id, z.array(id).min(1)]).transform((value) => [value].flat());
const dateTime = z.iso.datetime({ offset: true }).pipe(z.coerce.date());

const listQuery = z
  .object({
    from: dateTime.optional(),
    to: dateTime.optional(),
    includeRecurring: z.literal('true').optional(),
    categoryId: filterIds.optional(),
    tagId: filterIds.optional(),
  })
  .refine(({ from, to }) => !from || !to || from < to, {
    path: ['to'],
    message: 'Konec období musí být po jeho začátku',
  });

const recurrence = z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']);
const description = z.string().trim().max(2000);

const createRequest = z
  .strictObject({
    name: z.string().trim().min(1, 'Zadejte název aktivity.').max(200),
    description: description.optional(),
    recurrence: recurrence.optional(),
    startedAt: dateTime,
    endedAt: dateTime,
  })
  .refine(({ startedAt, endedAt }) => startedAt < endedAt, {
    path: ['endedAt'],
    message: 'Konec aktivity musí být po jejím začátku.',
  });

const activityResponse = z.object({
  id,
  name: z.string(),
  description: description.optional(),
  recurrence: recurrence.optional(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  categoryIds: z.array(id),
  tagIds: z.array(id),
});

const listResponse = z.object({
  items: z.array(activityResponse),
  hasActivities: z.boolean(),
});

export const activitySchema = { listQuery, createRequest, activityResponse, listResponse };

export type CreateActivityRequest = z.input<typeof createRequest>;
export type CreateActivityInput = z.output<typeof createRequest>;
export type ActivityResponse = z.infer<typeof activityResponse>;
export type ListActivitiesQuery = z.infer<typeof listQuery>;
export type ListActivitiesResponse = z.infer<typeof listResponse>;
