import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { PROFILE_NAME_MAX_LENGTH, userSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { auth } from '../backend/src/config/auth.js';
import { prisma } from '../backend/src/db/prisma.js';

type TestUser = { id: string; email: string; cookie: string };

function sessionCookie(response: Response): string {
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
  assert.ok(cookie);
  return cookie;
}

async function signUp(name: string, surname: string): Promise<TestUser> {
  const email = `user-profile-${randomUUID()}@example.com`;
  const response = await auth.api.signUpEmail({
    body: { name, surname, email, password: `Test1!${randomUUID()}` },
    asResponse: true,
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  return { id: body.user.id, email, cookie: sessionCookie(response) };
}

describe('Zobrazení a úprava vlastního profilu (MongoDB + HTTP)', { concurrency: false }, () => {
  let server: Server;
  let baseURL: string;
  let user: TestUser;

  const getProfile = (cookie?: string) =>
    fetch(`${baseURL}/api/users/profile`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
    });

  const updateProfile = (body: unknown, cookie?: string) =>
    fetch(`${baseURL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    });

  before(async () => {
    server = app.listen(0, '127.0.0.1');
    if (!server.listening) await once(server, 'listening');
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    user = await signUp('Jan', 'Novák');
  });

  afterEach(async () => {
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await prisma.$disconnect();
  });

  test('GET /api/users/profile vrátí profil přihlášeného uživatele ve sjednoceném formátu', async () => {
    const response = await getProfile(user.cookie);
    assert.equal(response.status, 200);

    const payload = userSchema.profileResponse.parse(await response.json());
    assert.deepEqual(payload, {
      name: 'Jan',
      surname: 'Novák',
      email: user.email,
      profileImageUrl: null,
    });
  });

  test('PUT /api/users/profile uloží oříznuté jméno a příjmení a vrátí aktualizovaný profil', async () => {
    const response = await updateProfile({ name: '  Petr  ', surname: '  Svoboda  ' }, user.cookie);
    assert.equal(response.status, 200);

    const payload = userSchema.profileResponse.parse(await response.json());
    assert.deepEqual(payload, {
      name: 'Petr',
      surname: 'Svoboda',
      email: user.email,
      profileImageUrl: null,
    });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert.equal(dbUser?.name, 'Petr');
    assert.equal(dbUser?.surname, 'Svoboda');
  });

  test('PUT /api/users/profile odmítne prázdné hodnoty, příliš dlouhé hodnoty a nepovolená pole', async () => {
    const invalidPayloads: unknown[] = [
      { name: '   ', surname: 'Novák' },
      { name: 'Jan', surname: '' },
      { name: 'a'.repeat(PROFILE_NAME_MAX_LENGTH + 1), surname: 'Novák' },
      { name: 'Jan', surname: 'b'.repeat(PROFILE_NAME_MAX_LENGTH + 1) },
      { name: 'Jan', surname: 'Novák', email: 'neplatny-email' },
      { name: 'Jan', surname: 'Novák', profileImageUrl: 'data:image/svg+xml;base64,AAAA' },
      { name: 'Jan', surname: 'Novák', role: 'admin' },
    ];

    for (const payload of invalidPayloads) {
      const response = await updateProfile(payload, user.cookie);
      assert.equal(response.status, 400);
    }
  });

  test('uloží obrázek a zachová ověřený e-mail', async () => {
    const profileImageUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X+ioAAAAASUVORK5CYII=';
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    const response = await updateProfile(
      { name: 'Jan', surname: 'Novák', profileImageUrl },
      user.cookie,
    );
    assert.equal(response.status, 200);
    const expected = { name: 'Jan', surname: 'Novák', email: user.email, profileImageUrl };
    assert.deepEqual(await response.json(), expected);
    assert.deepEqual(await (await getProfile(user.cookie)).json(), expected);
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    assert.equal(saved.emailVerified, true);
  });

  test('odmítne změnu e-mailu a ponechá původní profil', async () => {
    const response = await updateProfile(
      { name: 'Změněné jméno', surname: 'Novák', email: 'novy-email@example.com' },
      user.cookie,
    );
    assert.equal(response.status, 400);
    assert.deepEqual(await (await getProfile(user.cookie)).json(), {
      name: 'Jan',
      surname: 'Novák',
      email: user.email,
      profileImageUrl: null,
    });
  });

  test('GET a PUT /api/users/profile bez přihlášení vrátí 401', async () => {
    const getResponse = await getProfile();
    assert.equal(getResponse.status, 401);

    const putResponse = await updateProfile({ name: 'Petr', surname: 'Svoboda' });
    assert.equal(putResponse.status, 401);
  });
});
