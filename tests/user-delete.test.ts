import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { userSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { auth } from '../backend/src/config/auth.js';
import { prisma } from '../backend/src/db/prisma.js';
import userService from '../backend/src/modules/users/user.service.js';
import { AppError } from '../backend/src/shared/errors/app-error.js';

type TestUser = { id: string; email: string; cookie: string };

function sessionCookie(response: Response): string {
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
  assert.ok(cookie);
  return cookie;
}

async function signUp(name: string): Promise<TestUser> {
  const email = `user-delete-${randomUUID()}@example.com`;
  const response = await auth.api.signUpEmail({
    body: { name, surname: 'Test', email, password: `test-password-${randomUUID()}` },
    asResponse: true,
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  return { id: body.user.id, email, cookie: sessionCookie(response) };
}

// Requires a MongoDB replica set. Each test receives fresh users, organizations,
// memberships and invitations.
describe('Odstranění uživatelského účtu (MongoDB + HTTP)', { concurrency: false }, () => {
  let server: Server;
  let baseURL: string;
  // Tereza zakládá "Turistiku", Adam je v ní členem a sám vlastní "Běh", kde je Tereza členkou.
  // Tereza pozvala někoho do Turistiky i do Běhu, Adam pozval někoho do Běhu.
  let tereza: TestUser;
  let adam: TestUser;
  let turistikaId: string;
  let behId: string;
  let adamInvitationId: string;

  const remove = (userId: string, cookie: string) =>
    fetch(`${baseURL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: { cookie },
    });

  const me = (user: TestUser) => remove(user.id, user.cookie);

  const organizationIds = () => [turistikaId, behId];

  before(async () => {
    server = app.listen(0, '127.0.0.1');
    if (!server.listening) await once(server, 'listening');
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    tereza = await signUp('Tereza');
    adam = await signUp('Adam');
    turistikaId = randomUUID();
    behId = randomUUID();
    adamInvitationId = randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 86_400_000);

    await prisma.organization.createMany({
      data: [
        { id: turistikaId, name: 'Turistika', slug: `turistika-${turistikaId}`, createdAt },
        { id: behId, name: 'Běh', slug: `beh-${behId}`, createdAt },
      ],
    });
    await prisma.member.createMany({
      data: [
        {
          id: randomUUID(),
          organizationId: turistikaId,
          userId: tereza.id,
          role: 'owner',
          createdAt,
        },
        { id: randomUUID(), organizationId: turistikaId, userId: adam.id, createdAt },
        { id: randomUUID(), organizationId: behId, userId: adam.id, role: 'owner', createdAt },
        { id: randomUUID(), organizationId: behId, userId: tereza.id, createdAt },
      ],
    });
    await prisma.invitation.createMany({
      data: [
        { organizationId: turistikaId, inviterId: tereza.id },
        { organizationId: behId, inviterId: tereza.id },
        { organizationId: behId, inviterId: adam.id, id: adamInvitationId },
      ].map((invitation) => ({
        id: randomUUID(),
        email: `invited-${randomUUID()}@example.com`,
        status: 'pending',
        createdAt,
        expiresAt,
        ...invitation,
      })),
    });
  });

  afterEach(async () => {
    // Invitations and memberships first: they have no cascade from User.
    const userIds = [tereza.id, adam.id];
    const organizationId = { in: organizationIds() };
    await prisma.invitation.deleteMany({
      where: { OR: [{ organizationId }, { inviterId: { in: userIds } }] },
    });
    await prisma.member.deleteMany({
      where: { OR: [{ organizationId }, { userId: { in: userIds } }] },
    });
    await prisma.organization.deleteMany({ where: { id: organizationId } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  after(async () => {
    try {
      if (server)
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
    } finally {
      await prisma.$disconnect();
    }
  });

  test('unauthenticated requests return 401', async () => {
    assert.equal((await remove(tereza.id, '')).status, 401);
    assert.ok(await prisma.user.findUnique({ where: { id: tereza.id } }));
  });

  test('invalid user ID returns 400', async () => {
    assert.equal((await remove('invalid', tereza.cookie)).status, 400);
    assert.equal(userSchema.deleteParams.safeParse({ userId: 'invalid' }).success, false);
  });

  test('a regular user cannot delete another account', async () => {
    for (const userId of [adam.id, randomUUID()]) {
      const response = await remove(userId, tereza.cookie);
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), {
        error: 'Účet může odstranit pouze jeho vlastník',
      });
    }
    assert.ok(await prisma.user.findUnique({ where: { id: adam.id } }));
    assert.equal(await prisma.member.count({ where: { userId: adam.id } }), 2);
  });

  test('user deletes own account, owned organizations and personal data; others stay', async () => {
    const response = await me(tereza);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: 'Váš účet byl odstraněn.' });

    // The browser drops the session cookie, so the user is logged out on the client too.
    const { authCookies } = await auth.$context;
    const sessionCookieHeader = response.headers
      .getSetCookie()
      .find((value) => value.startsWith(`${authCookies.sessionToken.name}=;`));
    assert.ok(sessionCookieHeader, 'The session cookie must be expired');
    assert.match(sessionCookieHeader, /Max-Age=0/);

    assert.equal(await prisma.user.findUnique({ where: { id: tereza.id } }), null);
    assert.equal(await prisma.session.count({ where: { userId: tereza.id } }), 0);
    assert.equal(await prisma.account.count({ where: { userId: tereza.id } }), 0);
    assert.equal(await prisma.member.count({ where: { userId: tereza.id } }), 0);
    assert.equal(await prisma.invitation.count({ where: { inviterId: tereza.id } }), 0);

    // Tereza's own organization is deleted including Adam's membership and its invitations.
    assert.equal(await prisma.organization.findUnique({ where: { id: turistikaId } }), null);
    assert.equal(await prisma.member.count({ where: { organizationId: turistikaId } }), 0);
    assert.equal(await prisma.invitation.count({ where: { organizationId: turistikaId } }), 0);

    // Adam's organization survives, only without Tereza and her invitation.
    assert.ok(await prisma.organization.findUnique({ where: { id: behId } }));
    assert.deepEqual(
      await prisma.member.findMany({
        where: { organizationId: behId },
        select: { userId: true, role: true },
      }),
      [{ userId: adam.id, role: 'owner' }],
    );
    assert.deepEqual(
      await prisma.invitation.findMany({ where: { organizationId: behId }, select: { id: true } }),
      [{ id: adamInvitationId }],
    );
    assert.ok(await prisma.user.findUnique({ where: { id: adam.id } }));
    assert.ok(await prisma.session.count({ where: { userId: adam.id } }));

    // The deleted user loses access: the old session cookie is rejected.
    assert.equal((await me(tereza)).status, 401);
  });

  test('admin deletes another account and its owned organizations', async () => {
    const result = await userService.deleteUser({ id: randomUUID(), roles: ['admin'] }, adam.id);

    assert.deepEqual(result, { message: 'Váš účet byl odstraněn.' });
    assert.equal(await prisma.user.findUnique({ where: { id: adam.id } }), null);
    assert.equal(await prisma.organization.findUnique({ where: { id: behId } }), null);
    assert.equal(await prisma.member.count({ where: { organizationId: behId } }), 0);
    assert.equal(await prisma.invitation.count({ where: { organizationId: behId } }), 0);
    assert.ok(await prisma.organization.findUnique({ where: { id: turistikaId } }));
    assert.equal(await prisma.member.count({ where: { organizationId: turistikaId } }), 1);
  });

  test('admin deleting a missing account receives 404', async () => {
    await assert.rejects(
      userService.deleteUser({ id: randomUUID(), roles: ['admin'] }, randomUUID()),
      (error) =>
        error instanceof AppError && error.statusCode === 404 && error.message === 'User not found',
    );
  });

  test('a failure after deletion rolls everything back and allows retry', async (t) => {
    const snapshot = async () => ({
      user: await prisma.user.findUnique({ where: { id: tereza.id } }),
      sessions: await prisma.session.findMany({ where: { userId: tereza.id } }),
      accounts: await prisma.account.findMany({ where: { userId: tereza.id } }),
      organizations: await prisma.organization.findMany({
        where: { id: { in: organizationIds() } },
        orderBy: { id: 'asc' },
      }),
      members: await prisma.member.findMany({
        where: { organizationId: { in: organizationIds() } },
        orderBy: { id: 'asc' },
      }),
      invitations: await prisma.invitation.findMany({
        where: { organizationId: { in: organizationIds() } },
        orderBy: { id: 'asc' },
      }),
    });
    const before = await snapshot();
    let deletedUserId: string | undefined;

    // Run the actual deletion, then fail before the surrounding transaction commits.
    const failingClient = prisma.$extends({
      query: {
        user: {
          async delete({ args, query }) {
            const deleted = await query(args);
            if (args.where.id === tereza.id) {
              deletedUserId = deleted.id;
              throw new Error('Simulated failure after user deletion');
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
      const response = await me(tereza);
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), {
        error: 'Odstranění účtu se nezdařilo. Zkuste to prosím znovu',
      });
    } finally {
      prisma.$transaction = originalTransaction;
      logMock.mock.restore();
    }

    assert.equal(
      deletedUserId,
      tereza.id,
      'The actual user deletion must finish before the failure',
    );
    assert.deepEqual(await snapshot(), before);
    assert.equal((await me(tereza)).status, 200);
  });
});
