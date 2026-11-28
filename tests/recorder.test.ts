import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import {
  activityCalendarDate,
  activitySchema,
  pastActivityDateMessage,
} from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { env } from '../backend/src/config/env.js';
import { prisma } from '../backend/src/db/prisma.js';

describe('Zobrazení záznamníku a přidání aktivity (MongoDB)', () => {
  const runId = randomUUID();
  const emails = [`member.${runId}@example.com`, `outsider.${runId}@example.com`];
  const organizationId = randomUUID();
  const emptyOrganizationId = randomUUID();
  const otherOrganizationId = randomUUID();
  const organizationIds = [organizationId, emptyOrganizationId, otherOrganizationId];
  const groupPath = `/api/organizations/${organizationId}/activities`;
  const personalPath = '/api/users/activities';
  let server: Server | undefined;
  let baseURL: string;
  let memberCookie: string;
  let outsiderCookie: string;
  const userIds: string[] = [];

  async function signUp(email: string) {
    const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: env.corsOrigin },
      body: JSON.stringify({ email, name: 'Test', surname: 'Recorder', password: 'Heslo12345!' }),
    });
    assert.equal(response.status, 200);
    const { user } = await response.json();
    userIds.push(user.id);
    const cookie = response.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);
    return { userId: user.id as string, cookie };
  }

  async function readRecorder(path: string, cookie = memberCookie) {
    const response = await fetch(baseURL + path, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200);
    return activitySchema.listResponse.parse(await response.json());
  }

  function createActivity(path: string, body: object, cookie?: string) {
    return fetch(baseURL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { Cookie: cookie }),
      },
      body: JSON.stringify(body),
    });
  }

  before(async () => {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const member = await signUp(emails[0]);
    const outsider = await signUp(emails[1]);
    memberCookie = member.cookie;
    outsiderCookie = outsider.cookie;

    await prisma.organization.createMany({
      data: organizationIds.map((id) => ({ id, name: id, slug: id, createdAt: new Date() })),
    });
    await prisma.member.createMany({
      data: [organizationId, emptyOrganizationId].map((id) => ({
        id: randomUUID(),
        userId: member.userId,
        organizationId: id,
        createdAt: new Date(),
      })),
    });

    const activity = {
      userId: member.userId,
      startedAt: new Date('2026-11-16T09:00:00Z'),
      endedAt: new Date('2026-11-16T10:00:00Z'),
    };
    await prisma.activity.createMany({
      data: [
        { ...activity, name: 'Personal' },
        { ...activity, name: 'Group', organizationId, sharedOrganizationIds: [organizationId] },
        {
          ...activity,
          name: 'Shared',
          userId: outsider.userId,
          startedAt: new Date('2026-11-16T08:00:00Z'),
          sharedOrganizationIds: [organizationId],
          categoryIds: ['work'],
          tagIds: ['planning'],
        },
        { ...activity, name: 'Other group', organizationId: otherOrganizationId },
      ],
    });
  });

  after(async () => {
    if (server?.listening) {
      server.close();
      await once(server, 'close');
    }
    try {
      await prisma.activity.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.member.deleteMany({ where: { organizationId: { in: organizationIds } } });
      await prisma.organization.deleteMany({ where: { id: { in: organizationIds } } });
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('vlastní záznamník vrací osobní aktivity přihlášeného uživatele', async () => {
    const personal = await readRecorder(personalPath);
    assert.deepEqual(
      personal.items.map(({ name }) => name),
      ['Personal'],
    );
    assert.equal(personal.hasActivities, true);
  });

  test('záznamník skupiny vrací pouze vlastní a sdílené aktivity skupiny bez duplicit', async () => {
    const group = await readRecorder(groupPath);
    assert.deepEqual(
      group.items.map(({ name }) => name),
      ['Shared', 'Group'],
    );
    assert.equal(group.hasActivities, true);
  });

  test('období, kategorie a štítky se filtrují společně a prázdný výsledek zachová stav záznamníku', async () => {
    const filters = '&categoryId=other&categoryId=work&tagId=planning';
    const overlap = await readRecorder(
      `${groupPath}?from=2026-11-16T09:00:00Z&to=2026-11-16T09:30:00Z${filters}`,
    );
    assert.deepEqual(
      overlap.items.map(({ name }) => name),
      ['Shared'],
    );
    assert.deepEqual(await readRecorder(`${groupPath}?from=2026-11-16T10:00:00Z${filters}`), {
      items: [],
      hasActivities: true,
    });
    assert.deepEqual(await readRecorder(`/api/organizations/${emptyOrganizationId}/activities`), {
      items: [],
      hasActivities: false,
    });
  });

  test('nepřihlášený uživatel ani nečlen skupiny nemají přístup a nesprávné období je odmítnuto', async () => {
    assert.equal((await fetch(baseURL + personalPath)).status, 401);
    assert.equal(
      (await fetch(baseURL + groupPath, { headers: { Cookie: outsiderCookie } })).status,
      403,
    );
    const invalidRange = '?from=2026-11-17T00:00:00Z&to=2026-11-16T00:00:00Z';
    assert.equal(
      (await fetch(baseURL + groupPath + invalidRange, { headers: { Cookie: memberCookie } }))
        .status,
      400,
    );
  });

  const today = activityCalendarDate();
  const interval = {
    name: '  Plánování  ',
    startedAt: `${today}T12:00:00Z`,
    endedAt: `${today}T13:00:00Z`,
  };

  test('uloží osobní i skupinovou aktivitu do správného záznamníku', async () => {
    const filters = `?from=${today}T11:00:00Z&to=${today}T14:00:00Z`;
    const personal = await createActivity(personalPath, interval, memberCookie);
    assert.equal(personal.status, 201);
    const saved = activitySchema.activityResponse.parse(await personal.json());
    assert.equal(saved.name, 'Plánování');
    assert.equal(saved.startedAt.toISOString(), `${today}T12:00:00.000Z`);
    assert.deepEqual((await readRecorder(personalPath + filters)).items, [saved]);
    assert.deepEqual((await readRecorder(personalPath + filters, outsiderCookie)).items, []);
    assert.deepEqual((await readRecorder(groupPath + filters)).items, []);

    const group = await createActivity(groupPath, { ...interval, name: 'Porada' }, memberCookie);
    assert.equal(group.status, 201);
    const savedGroup = activitySchema.activityResponse.parse(await group.json());
    assert.deepEqual((await readRecorder(groupPath + filters)).items, [savedGroup]);
    assert.deepEqual((await readRecorder(personalPath + filters)).items, [saved]);
  });

  test('odmítne vytvoření osobní i skupinové aktivity před dneškem', async () => {
    const yesterday = activityCalendarDate(new Date(Date.parse(interval.startedAt) - 86_400_000));
    for (const path of [personalPath, groupPath]) {
      const response = await createActivity(
        path,
        { ...interval, startedAt: `${yesterday}T12:00:00Z`, endedAt: `${yesterday}T13:00:00Z` },
        memberCookie,
      );
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error, pastActivityDateMessage);
    }
  });

  test('odmítne nepřihlášené uživatele, nečleny a neplatné aktivity', async () => {
    assert.equal((await createActivity(personalPath, interval)).status, 401);
    assert.equal((await createActivity(groupPath, interval, outsiderCookie)).status, 403);

    const count = await prisma.activity.count({ where: { userId: userIds[0] } });
    for (const body of [
      { ...interval, endedAt: interval.startedAt },
      { ...interval, name: ' ' },
      { ...interval, userId: userIds[1] },
      { ...interval, organizationId: otherOrganizationId },
    ]) {
      assert.equal((await createActivity(personalPath, body, memberCookie)).status, 400);
    }
    assert.equal(await prisma.activity.count({ where: { userId: userIds[0] } }), count);
  });
});
