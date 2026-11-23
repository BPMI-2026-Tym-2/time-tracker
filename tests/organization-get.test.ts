import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { after, before, describe, test } from 'node:test';

// Requires MongoDB replica set. Fixtures use a separate test database.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'mongodb://127.0.0.1:27017/time_tracker_organization_get_test?replicaSet=rs0&directConnection=true';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3001';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
process.env.BETTER_AUTH_SECRET ??= 'organization-get-test-secret-at-least-32-characters';
process.env.GOOGLE_CLIENT_ID ??= 'organization-get-test';
process.env.GOOGLE_CLIENT_SECRET ??= 'organization-get-test';

let auth: typeof import('../backend/src/config/auth.js').auth;
let prisma: typeof import('../backend/src/db/prisma.js').prisma;

const runId = randomUUID();
const users: { id: string; cookie: string }[] = [];
const organizationIds: string[] = [];
let server: Server;
let baseURL: string;
let organizationId: string;
let ownerlessOrganizationId: string;

const [OWNER, MEMBER, OUTSIDER, ADMIN, ADMIN_MEMBER] = [0, 1, 2, 3, 4];

function get(id: string, userIndex?: number) {
  return fetch(`${baseURL}/api/organizations/${encodeURIComponent(id)}`, {
    headers: userIndex === undefined ? {} : { cookie: users[userIndex].cookie },
  });
}

async function createOrganization(members: { userIndex: number; role: string }[], extra = {}) {
  const id = randomUUID();
  organizationIds.push(id);
  await prisma.organization.create({
    data: { id, name: 'Get test', slug: id, createdAt: new Date(), ...extra },
  });
  await prisma.member.createMany({
    data: members.map(({ userIndex, role }, index) => ({
      id: randomUUID(),
      organizationId: id,
      userId: users[userIndex].id,
      role,
      createdAt: new Date(Date.now() + index),
    })),
  });
  return id;
}

describe('GET /api/organizations/:organizationId (HTTP + Better Auth + MongoDB)', () => {
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

    for (const name of ['Owner', 'Member', 'Outsider', 'Admin', 'AdminMember']) {
      const { headers, response } = await auth.api.signUpEmail({
        body: {
          name,
          surname: 'Get test',
          email: `${name.toLowerCase()}-${runId}@example.com`,
          password: `Test1!${runId}`,
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
    for (const index of [ADMIN, ADMIN_MEMBER]) {
      await prisma.user.update({ where: { id: users[index].id }, data: { role: 'admin' } });
    }

    organizationId = await createOrganization(
      [
        { userIndex: OWNER, role: 'owner' },
        { userIndex: MEMBER, role: 'member' },
        { userIndex: ADMIN_MEMBER, role: 'member' },
      ],
      { description: 'Popis skupiny', categories: ['Práce'], tags: ['Důležité', 'Tým'] },
    );
    ownerlessOrganizationId = await createOrganization([{ userIndex: MEMBER, role: 'member' }], {
      metadata: JSON.stringify({ description: 'Legacy popis' }),
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    try {
      const userId = { in: users.map((user) => user.id) };
      const orgId = { in: organizationIds };
      await prisma.member.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('owner receives the full detail with currentUserRole owner', async () => {
    const response = await get(organizationId, OWNER);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.id, organizationId);
    assert.equal(data.name, 'Get test');
    assert.equal(data.slug, organizationId);
    assert.equal(data.description, 'Popis skupiny');
    assert.deepEqual(data.categories, ['Práce']);
    assert.deepEqual(data.tags, ['Důležité', 'Tým']);
    assert.equal(data.logo, null);
    assert.deepEqual(data.owner, { id: users[OWNER].id, name: 'Owner', surname: 'Get test' });
    assert.equal(data.memberCount, 3);
    assert.equal(data.currentUserRole, 'owner');
  });

  test('ordinary member receives currentUserRole member', async () => {
    const response = await get(organizationId, MEMBER);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).currentUserRole, 'member');
  });

  test('global admin who is not a member receives the detail with null role', async () => {
    const response = await get(organizationId, ADMIN);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).currentUserRole, null);
  });

  test('global admin who is a member keeps the real organization role', async () => {
    const response = await get(organizationId, ADMIN_MEMBER);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).currentUserRole, 'member');
  });

  test('unauthenticated request returns 401', async () => {
    assert.equal((await get(organizationId)).status, 401);
  });

  test('invalid organization ID returns 400', async () => {
    for (const id of ['abc', '123', 'not-a-uuid']) {
      assert.equal((await get(id, OWNER)).status, 400, id);
    }
  });

  test('nonexistent organization returns 404 for members, outsiders and admins', async () => {
    for (const index of [OWNER, OUTSIDER, ADMIN]) {
      const response = await get(randomUUID(), index);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { error: 'Skupina nebyla nalezena' });
    }
  });

  test('outsider who is neither a member nor an admin returns 403', async () => {
    const response = await get(organizationId, OUTSIDER);
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      error: 'Nemáte dostatečná oprávnění v této organizaci!',
    });
  });

  test('missing owner and legacy metadata do not break the endpoint', async () => {
    const response = await get(ownerlessOrganizationId, MEMBER);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.owner, null);
    assert.equal(data.description, 'Legacy popis');
    assert.deepEqual(data.categories, []);
    assert.deepEqual(data.tags, []);
    assert.equal(data.memberCount, 1);
  });
});
