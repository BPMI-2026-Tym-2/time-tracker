import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { activitySchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { env } from '../backend/src/config/env.js';
import { prisma } from '../backend/src/db/prisma.js';

describe('Zobrazení záznamníku (MongoDB)', () => {
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
});
