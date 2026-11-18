import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { after, before, describe, test } from 'node:test';

// Requires a MongoDB replica set; fixtures use a separate test database.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'mongodb://127.0.0.1:27017/time_tracker_invitations_test?replicaSet=rs0&directConnection=true';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3001';
const corsOrigin = (process.env.CORS_ORIGIN ??= 'http://localhost:3000');
process.env.BETTER_AUTH_SECRET ??= 'invitation-test-secret-at-least-32-characters';
process.env.GOOGLE_CLIENT_ID ??= 'invitation-test';
process.env.GOOGLE_CLIENT_SECRET ??= 'invitation-test';

let prisma: typeof import('../backend/src/db/prisma.js').prisma;
let server: Server;
let baseURL: string;
const runId = randomUUID();
const organizationId = randomUUID();
const users: { id: string; email: string; cookie: string }[] = [];

function request(path: string, userIndex?: number, body?: unknown, origin = corsOrigin) {
  return fetch(`${baseURL}/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      origin,
      ...(userIndex !== undefined && { cookie: users[userIndex].cookie }),
      ...(body !== undefined && { 'content-type': 'application/json' }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
}

function invite(email: unknown, userIndex: number | undefined = 0, org = organizationId) {
  return request(`/organizations/${org}/invitations`, userIndex, { email });
}

describe('Invitations and notification inbox (HTTP + Better Auth + MongoDB)', () => {
  before(async () => {
    const [appModule, authModule, prismaModule] = await Promise.all([
      import('../backend/src/app.js'),
      import('../backend/src/config/auth.js'),
      import('../backend/src/db/prisma.js'),
    ]);
    prisma = prismaModule.prisma;
    server = appModule.app.listen(0, '127.0.0.1');
    if (!server.listening) await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    baseURL = `http://127.0.0.1:${address.port}`;
    for (const name of ['Owner', 'Member', 'Recipient', 'Outsider', 'Unverified']) {
      const { headers, response } = await authModule.auth.api.signUpEmail({
        body: {
          name,
          surname: 'Invitation test',
          email: `${name.toLowerCase()}-${runId}@example.com`,
          password: `Test1!${runId}`,
        },
        returnHeaders: true,
      });
      users.push({
        id: response.user.id,
        email: response.user.email,
        cookie: headers
          .getSetCookie()
          .map((value) => value.split(';')[0])
          .join('; '),
      });
      if (name !== 'Unverified') {
        await prisma.user.update({
          where: { id: response.user.id },
          data: { emailVerified: true },
        });
      }
    }
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Invitation test',
        slug: organizationId,
        createdAt: new Date(),
      },
    });
    await prisma.member.createMany({
      data: users.slice(0, 2).map((user, index) => ({
        id: randomUUID(),
        userId: user.id,
        organizationId,
        role: index === 0 ? 'owner' : 'member',
        createdAt: new Date(),
      })),
    });
  });

  after(async () => {
    if (server)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    if (!prisma) return;
    try {
      const userIds = { in: users.map((user) => user.id) };
      await prisma.invitation.deleteMany({ where: { organizationId } });
      await prisma.member.deleteMany({ where: { organizationId } });
      await prisma.organization.deleteMany({ where: { id: organizationId } });
      await prisma.session.deleteMany({ where: { userId: userIds } });
      await prisma.account.deleteMany({ where: { userId: userIds } });
      await prisma.user.deleteMany({ where: { id: userIds } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('invalid input, unauthenticated users, members and outsiders cannot create invitations', async () => {
    for (const email of [undefined, '', 'invalid', 123]) {
      const response = await invite(email);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: 'Zadejte platnou e-mailovou adresu.' });
    }
    assert.equal(
      (
        await request(`/organizations/${organizationId}/invitations`, undefined, {
          email: users[2].email,
        })
      ).status,
      401,
    );
    assert.equal((await invite(users[2].email, 1)).status, 403);
    assert.equal((await invite(users[2].email, 3)).status, 400);
    assert.equal((await invite(users[2].email, 0, randomUUID())).status, 400);
    assert.equal((await invite(users[1].email)).status, 400);
    assert.equal(await prisma.invitation.count({ where: { organizationId } }), 0);
  });

  test('owner creates a normalized invitation; only the recipient sees it and can accept it', async () => {
    const response = await invite(`  ${users[2].email.toUpperCase()}  `);
    assert.equal(response.status, 201);
    const invitation = await response.json();
    assert.equal(invitation.email, users[2].email);
    assert.equal(invitation.role, 'member');
    assert.equal(invitation.status, 'pending');
    assert.equal(await prisma.member.count({ where: { organizationId } }), 2);
    const inbox = await request('/notifications', 2);
    assert.equal(inbox.status, 200);
    assert.deepEqual(
      (await inbox.json()).items.map((item: { id: string }) => item.id),
      [invitation.id],
    );
    // A client-supplied email cannot change the recipient scope.
    assert.deepEqual(await (await request(`/notifications?email=${users[2].email}`, 3)).json(), {
      items: [],
    });
    assert.equal((await request('/notifications')).status, 401);
    const acceptPath = `/organizations/invitations/${invitation.id}/accept`;
    assert.equal((await request(acceptPath, undefined, {})).status, 401);
    assert.equal((await request(acceptPath, 3, {})).status, 403);
    assert.equal((await request(acceptPath, 2, {}, 'https://untrusted.example')).status, 403);
    assert.equal((await request(acceptPath, 2, {})).status, 200);
    assert.equal(await prisma.member.count({ where: { organizationId, userId: users[2].id } }), 1);
    assert.deepEqual(await (await request('/notifications', 2)).json(), { items: [] });
  });

  test('reinviting replaces pending notification; rejection and expiration remove it', async () => {
    const first = await (await invite(users[3].email)).json();
    const second = await (await invite(users[3].email)).json();
    assert.notEqual(first.id, second.id);
    assert.equal(
      (await prisma.invitation.findUniqueOrThrow({ where: { id: first.id } })).status,
      'canceled',
    );
    assert.deepEqual(
      (await (await request('/notifications', 3)).json()).items.map(
        (item: { id: string }) => item.id,
      ),
      [second.id],
    );
    assert.equal(
      (await request(`/organizations/invitations/${second.id}/reject`, 3, {})).status,
      200,
    );
    assert.deepEqual(await (await request('/notifications', 3)).json(), { items: [] });
    const expired = await (await invite(users[3].email)).json();
    await prisma.invitation.update({ where: { id: expired.id }, data: { expiresAt: new Date(0) } });
    assert.deepEqual(await (await request('/notifications', 3)).json(), { items: [] });
    assert.equal(
      (await request(`/organizations/invitations/${expired.id}/accept`, 3, {})).status,
      400,
    );
    assert.equal(await prisma.member.count({ where: { organizationId, userId: users[3].id } }), 0);
  });

  test('unverified accounts cannot enumerate invitations', async () => {
    assert.equal((await invite(users[4].email)).status, 201);
    assert.equal((await request('/notifications', 4)).status, 403);
  });

  test('delivery persists for an email without an account; database failure permits retry', async (t) => {
    const email = `future-${runId}@example.com`;
    const originalCreate = prisma.invitation.create;
    t.after(() => {
      prisma.invitation.create = originalCreate;
    });
    prisma.invitation.create = async () => {
      throw new Error('Simulated write failure');
    };
    const log = t.mock.method(console, 'error', () => {});
    const response = await invite(email);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Pozvánku se nepodařilo odeslat' });
    assert.equal(await prisma.invitation.count({ where: { organizationId, email } }), 0);
    prisma.invitation.create = originalCreate;
    log.mock.restore();
    assert.equal((await invite(email)).status, 201);
    assert.equal(
      await prisma.invitation.count({ where: { organizationId, email, status: 'pending' } }),
      1,
    );
  });
});
