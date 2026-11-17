import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { after, before, describe, test } from 'node:test';
import type { Prisma } from '@prisma/client';

// Requires MongoDB replica set. Keep test fixtures separate from application data.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'mongodb://127.0.0.1:27017/time_tracker_organization_delete_test?replicaSet=rs0&directConnection=true';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3001';
process.env.BETTER_AUTH_SECRET ??= 'organization-deletion-test-secret-at-least-32-characters';
process.env.GOOGLE_CLIENT_ID ??= 'organization-deletion-test';
process.env.GOOGLE_CLIENT_SECRET ??= 'organization-deletion-test';

let auth: typeof import('../backend/src/config/auth.js').auth;
let prisma: typeof import('../backend/src/db/prisma.js').prisma;

const runId = randomUUID();
const users: { id: string; cookie: string }[] = [];
const organizationIds: string[] = [];
const taskId = randomUUID();
let server: Server;
let baseURL: string;

async function createOrganization() {
  const id = randomUUID();
  organizationIds.push(id);
  await prisma.organization.create({
    data: { id, name: 'Delete test', slug: id, createdAt: new Date() },
  });
  await prisma.member.createMany({
    data: users.slice(0, 2).map((user, index) => ({
      id: randomUUID(),
      organizationId: id,
      userId: user.id,
      role: index === 0 ? 'owner' : 'member',
      createdAt: new Date(),
    })),
  });
  await prisma.invitation.create({
    data: {
      id: randomUUID(),
      organizationId: id,
      inviterId: users[0].id,
      email: `invited-${runId}@example.com`,
      role: 'member',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000),
    },
  });
  return id;
}

function remove(organizationId: string, cookie?: string) {
  return fetch(`${baseURL}/api/organizations/${encodeURIComponent(organizationId)}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : {},
  });
}

async function assertIntact(id: string) {
  assert.ok(await prisma.organization.findUnique({ where: { id } }));
  assert.equal(await prisma.member.count({ where: { organizationId: id } }), 2);
  assert.equal(await prisma.invitation.count({ where: { organizationId: id } }), 1);
}

describe('Organization deletion (HTTP + Better Auth + MongoDB replica set)', () => {
  before(async () => {
    const [appModule, authModule, prismaModule] = await Promise.all([
      import('../backend/src/app.js'),
      import('../backend/src/config/auth.js'),
      import('../backend/src/db/prisma.js'),
    ]);
    auth = authModule.auth;
    prisma = prismaModule.prisma;
    server = appModule.app.listen(0, '127.0.0.1');
    if (!server.listening) await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    baseURL = `http://127.0.0.1:${address.port}`;

    for (const name of ['Owner', 'Member', 'Outsider', 'Admin']) {
      const { headers, response } = await auth.api.signUpEmail({
        body: {
          name,
          surname: 'Delete test',
          email: `${name.toLowerCase()}-${runId}@example.com`,
          password: `test-password-${runId}`,
        },
        returnHeaders: true,
      });
      const cookie = headers
        .getSetCookie()
        .map((value) => value.split(';')[0])
        .join('; ');
      assert.ok(cookie);
      users.push({ id: response.user.id, cookie });
    }
    await prisma.user.update({ where: { id: users[3].id }, data: { role: 'admin' } });
    await prisma.task.create({ data: { id: taskId, title: 'Unrelated task' } });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    try {
      const organizationId = { in: organizationIds };
      const userId = { in: users.map((user) => user.id) };
      await prisma.invitation.deleteMany({ where: { organizationId } });
      await prisma.member.deleteMany({ where: { organizationId } });
      await prisma.organization.deleteMany({ where: { id: organizationId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
      await prisma.task.deleteMany({ where: { id: taskId } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('owner deletes organization, memberships and invitations, preserving unrelated data', async () => {
    const id = await createOrganization();
    const otherId = await createOrganization();
    await auth.api.setActiveOrganization({
      headers: new Headers({ cookie: users[0].cookie }),
      body: { organizationId: id },
    });

    const response = await remove(id, users[0].cookie);
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    assert.equal(await prisma.organization.findUnique({ where: { id } }), null);
    assert.equal(await prisma.member.count({ where: { organizationId: id } }), 0);
    assert.equal(await prisma.invitation.count({ where: { organizationId: id } }), 0);
    await assertIntact(otherId);
    assert.ok(await prisma.task.findUnique({ where: { id: taskId } }));
    assert.equal(await prisma.user.count({ where: { id: { in: users.map((u) => u.id) } } }), 4);

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: users[0].cookie }),
    });
    assert.equal(session?.session.activeOrganizationId, null);
    for (const user of users.slice(0, 2)) {
      const headers = new Headers({ cookie: user.cookie });
      const organizations = await auth.api.listOrganizations({ headers });
      assert.ok(organizations.every((organization) => organization.id !== id));
      await assert.rejects(
        auth.api.setActiveOrganization({ headers, body: { organizationId: id } }),
      );
    }

    assert.equal((await remove(id, users[0].cookie)).status, 400);
  });

  test('unauthenticated request returns 401 without deleting data', async () => {
    const id = await createOrganization();
    assert.equal((await remove(id)).status, 401);
    await assertIntact(id);
  });

  test('ordinary member returns 403 without deleting data', async () => {
    const id = await createOrganization();
    assert.equal((await remove(id, users[1].cookie)).status, 403);
    await assertIntact(id);
  });

  test('outsider and global admin cannot delete an organization they do not own', async () => {
    const id = await createOrganization();
    for (const user of users.slice(2)) {
      assert.equal((await remove(id, user.cookie)).status, 400);
      await assertIntact(id);
    }
  });

  test('nonexistent organization is rejected', async () => {
    assert.equal((await remove(randomUUID(), users[0].cookie)).status, 400);
  });

  test('database failure rolls back membership and invitation deletion and permits retry', async (t) => {
    const id = await createOrganization();
    const originalTransaction = prisma.$transaction;
    const transact = originalTransaction.bind(prisma);
    const failure = new Error('Simulated organization delete failure');
    t.after(() => {
      prisma.$transaction = originalTransaction;
    });
    prisma.$transaction = ((callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
      transact(async (tx) => {
        tx.organization.delete = async () => {
          throw failure;
        };
        return callback(tx);
      })) as typeof prisma.$transaction;
    const log = t.mock.method(console, 'error', () => {});

    const response = await remove(id, users[0].cookie);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: 'Odstranění skupiny se nezdařilo. Zkuste to prosím znovu',
    });
    assert.equal(log.mock.calls[0].arguments[0], failure);
    await assertIntact(id);

    prisma.$transaction = originalTransaction;
    assert.equal((await remove(id, users[0].cookie)).status, 204);
  });
});
