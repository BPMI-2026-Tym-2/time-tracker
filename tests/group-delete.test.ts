import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { groupSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { prisma } from '../backend/src/db/prisma.js';
import { auth } from '../backend/src/modules/auth/auth.config.js';
import groupService from '../backend/src/modules/groups/group.service.js';
import { AppError } from '../backend/src/shared/errors/app-error.js';

type TestUser = { id: string; email: string; password: string; cookie: string };

function sessionCookie(response: Response): string {
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
  assert.ok(cookie);
  return cookie;
}

// Requires a MongoDB replica set. Each test receives fresh groups and memberships.
describe('Odstranění skupiny (MongoDB + HTTP)', { concurrency: false }, () => {
  const users: TestUser[] = [];
  let owner: TestUser;
  let member: TestUser;
  let outsider: TestUser;
  let server: Server;
  let baseURL: string;
  let groupId: string;
  let otherGroupId: string;

  const remove = (id = groupId, cookie = owner.cookie) =>
    fetch(`${baseURL}/groups/${id}`, {
      method: 'DELETE',
      headers: { cookie },
    });

  before(async () => {
    server = app.listen(0, '127.0.0.1');
    if (!server.listening) await once(server, 'listening');
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    for (const name of ['Owner', 'Member', 'Outsider']) {
      const email = `delete-${randomUUID()}@example.com`;
      const password = `test-password-${randomUUID()}`;
      const response = await auth.api.signUpEmail({
        body: { name, surname: 'Test', email, password },
        asResponse: true,
      });
      assert.equal(response.status, 200);
      const body = await response.json();
      users.push({ id: body.user.id, email, password, cookie: sessionCookie(response) });
    }
    [owner, member, outsider] = users;
  });

  beforeEach(async () => {
    groupId = randomUUID();
    otherGroupId = randomUUID();
    await prisma.group.createMany({
      data: [
        { id: groupId, name: 'Delete test' },
        { id: otherGroupId, name: 'Keep test' },
      ],
    });
    await prisma.groupMember.createMany({
      data: [
        { groupId, userId: owner.id, role: 'owner' },
        { groupId, userId: member.id },
        { groupId: otherGroupId, userId: member.id, role: 'owner' },
      ],
    });
  });

  afterEach(async () => {
    await prisma.group.deleteMany({ where: { id: { in: [groupId, otherGroupId] } } });
  });

  after(async () => {
    try {
      if (server)
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('unauthenticated requests return 401', async () => {
    assert.equal((await remove(groupId, '')).status, 401);
    assert.ok(await prisma.group.findUnique({ where: { id: groupId } }));
  });

  test('invalid group ID returns 400', async () => {
    assert.equal((await remove('invalid')).status, 400);
    assert.equal(groupSchema.deleteParams.safeParse({ groupId: 'invalid' }).success, false);
  });

  test('authenticated members and outsiders receive 403', async () => {
    for (const user of [member, outsider]) {
      const response = await remove(groupId, user.cookie);
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), {
        error: 'Skupinu může odstranit pouze její vlastník',
      });
    }
    assert.ok(await prisma.group.findUnique({ where: { id: groupId } }));
    assert.equal(await prisma.groupMember.count({ where: { groupId } }), 2);
  });

  for (const state of ['expired', 'revoked'] as const) {
    test(`${state} sessions receive 401`, async () => {
      const response = await auth.api.signInEmail({
        body: { email: owner.email, password: owner.password },
        asResponse: true,
      });
      assert.equal(response.status, 200);
      const cookie = sessionCookie(response);
      const { token } = await response.json();
      assert.equal(typeof token, 'string');
      if (state === 'expired') {
        await prisma.session.update({ where: { token }, data: { expiresAt: new Date(0) } });
      } else {
        await prisma.session.delete({ where: { token } });
      }
      assert.equal((await remove(groupId, cookie)).status, 401);
      assert.ok(await prisma.group.findUnique({ where: { id: groupId } }));
    });
  }

  test('a missing group returns 404', async () => {
    const response = await remove(randomUUID());
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Group not found' });
  });

  test('a failure after deletion rolls back the group and memberships and allows retry', async (t) => {
    const memberships = await prisma.groupMember.findMany({
      where: { groupId },
      orderBy: { id: 'asc' },
    });
    const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    let deletedGroupId: string | undefined;
    // Run the actual deletion, then fail before the surrounding transaction commits.
    const failingClient = prisma.$extends({
      query: {
        group: {
          async delete({ args, query }) {
            const deleted = await query(args);
            if (args.where.id === groupId) {
              deletedGroupId = deleted.id;
              throw new Error('Simulated failure after group deletion');
            }
            return deleted;
          },
        },
      },
    });
    const originalTransaction = prisma.$transaction;
    Object.assign(prisma, { $transaction: failingClient.$transaction.bind(failingClient) });
    const logMock = t.mock.method(console, 'error', () => {});
    try {
      const response = await remove();
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        error: 'Odstranění skupiny se nezdařilo. Zkuste to prosím znovu',
      });
    } finally {
      prisma.$transaction = originalTransaction;
      logMock.mock.restore();
    }
    assert.equal(
      deletedGroupId,
      groupId,
      'The actual group deletion must finish before the failure',
    );
    assert.deepEqual(await prisma.group.findUnique({ where: { id: groupId } }), group);
    assert.deepEqual(
      await prisma.groupMember.findMany({ where: { groupId }, orderBy: { id: 'asc' } }),
      memberships,
    );
    assert.equal((await remove()).status, 200);
  });

  test('owner deletes the group and memberships, preserving other groups', async () => {
    const response = await remove();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: 'Skupina byla úspěšně odstraněna.' });
    assert.equal(await prisma.group.findUnique({ where: { id: groupId } }), null);
    assert.equal(await prisma.groupMember.count({ where: { groupId } }), 0);
    assert.ok(await prisma.group.findUnique({ where: { id: otherGroupId } }));
    assert.equal(await prisma.groupMember.count({ where: { groupId: otherGroupId } }), 1);
    await assert.rejects(
      groupService.listMembers({ id: member.id, role: 'user' }, groupId, { page: 1, pageSize: 20 }),
      (error) => error instanceof AppError && error.statusCode === 404,
    );
    assert.equal((await remove()).status, 404);
  });

  test('deletion does not touch the unrelated example Task model', async (t) => {
    const task = await prisma.task.create({ data: { title: 'Example task' } });
    t.after(async () => {
      await prisma.task.deleteMany({ where: { id: task.id } });
    });
    assert.equal((await remove()).status, 200);
    assert.deepEqual(await prisma.task.findUnique({ where: { id: task.id } }), task);
  });
});
