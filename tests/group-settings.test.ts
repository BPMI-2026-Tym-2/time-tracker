import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { groupSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { prisma } from '../backend/src/db/prisma.js';

const runId = randomUUID().slice(0, 8);

const terezaData = {
  name: 'Tereza',
  surname: 'Nováková',
  email: `tereza.${runId}@unicorn.cz`,
  password: 'Password123!',
};

const adamData = {
  name: 'Adam',
  surname: 'Dvořák',
  email: `adam.${runId}@unicorn.cz`,
  password: 'Password123!',
};

const outsiderData = {
  name: 'Petr',
  surname: 'Černý',
  email: `petr.${runId}@unicorn.cz`,
  password: 'Password123!',
};

const superAdminData = {
  name: 'Super',
  surname: 'Admin',
  email: `admin.${runId}@unicorn.cz`,
  password: 'Password123!',
};

const groupId = randomUUID();
const ownerlessGroupId = randomUUID();

let server: Server;
let baseUrl: string;

let terezaCookie: string;
let adamCookie: string;
let outsiderCookie: string;
let superAdminCookie: string;

let terezaId: string;
let adamId: string;
let outsiderId: string;
let superAdminId: string;

let isDbAvailable = false;
let setupError: Error | null = null;

async function signUpAndGetCookie(user: {
  name: string;
  surname: string;
  email: string;
  password: string;
}) {
  const trustedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: trustedOrigin,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to sign up ${user.email} (HTTP ${res.status}): ${errorText}`);
  }

  const setCookies = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie') ?? ''];
  const sessionTokenCookie = setCookies
    .map((c) => c.split(';')[0].trim())
    .find((c) => c.startsWith('better-auth.session_token='));

  if (!sessionTokenCookie) {
    throw new Error(`No signed better-auth.session_token cookie returned for ${user.email}`);
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },
  });

  return { id: dbUser.id, cookie: sessionTokenCookie };
}

describe('Nastavení skupiny – HTTP & Bezpečnost', () => {
  before(async () => {
    // Spuštění HTTP serveru na náhodném volném portu
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    try {
      await prisma.$connect();

      // Vytvoření uživatelů a získání podepsaných cookies přímo přes Better Auth
      const terezaRes = await signUpAndGetCookie(terezaData);
      terezaId = terezaRes.id;
      terezaCookie = terezaRes.cookie;

      const adamRes = await signUpAndGetCookie(adamData);
      adamId = adamRes.id;
      adamCookie = adamRes.cookie;

      const outsiderRes = await signUpAndGetCookie(outsiderData);
      outsiderId = outsiderRes.id;
      outsiderCookie = outsiderRes.cookie;

      const adminRes = await signUpAndGetCookie(superAdminData);
      superAdminId = adminRes.id;
      superAdminCookie = adminRes.cookie;

      // Aktualizace role superAdmin v databázi pro administrátora
      await prisma.user.update({
        where: { id: superAdminId },
        data: { role: 'superAdmin' },
      });

      // Vytvoření testovací skupiny
      await prisma.group.create({
        data: {
          id: groupId,
          name: 'Vývojový tým Alfa',
          description: 'Původní popis skupiny',
          category: 'Vývoj aplikací',
          color: 'blue',
          logo: 'rocket',
          visibility: 'private',
        },
      });

      // Vytvoření skupiny bez vlastníka
      await prisma.group.create({
        data: {
          id: ownerlessGroupId,
          name: 'Skupina bez vlastníka',
        },
      });

      // Přiřazení členství ve skupině
      await prisma.groupMember.create({
        data: { groupId, userId: terezaId, role: 'owner', joinedAt: new Date(2026, 9, 1) },
      });
      await prisma.groupMember.create({
        data: { groupId, userId: adamId, role: 'member', joinedAt: new Date(2026, 9, 2) },
      });

      isDbAvailable = true;
    } catch (err) {
      setupError = err as Error;
      if (process.env.CI) {
        // V CI prostředí musí selhání fixture setupu shodit celý test run
        throw new Error(`CI fixture setup failed: ${setupError.message}`);
      }
      isDbAvailable = false;
    }
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    if (isDbAvailable) {
      try {
        await prisma.groupMember.deleteMany({
          where: { groupId: { in: [groupId, ownerlessGroupId] } },
        });
        await prisma.group.deleteMany({ where: { id: { in: [groupId, ownerlessGroupId] } } });
        const userIds = [terezaId, adamId, outsiderId, superAdminId].filter(Boolean);
        await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        await prisma.$disconnect();
      } catch {
        // Ignorovat chybu při úklidu
      }
    } else {
      await prisma.$disconnect().catch(() => {});
    }
  });

  test('CORS: OPTIONS preflight obsahuje PATCH v povolených metodách', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'PATCH',
      },
    });

    assert.equal(res.status, 204);
    const allowMethods = res.headers.get('access-control-allow-methods') ?? '';
    assert.match(allowMethods, /PATCH/);
    assert.match(allowMethods, /GET/);
  });

  test('P0 Bezpečnost: Anonymní GET s podvrženými hlavičkami x-user-* vrátí 401', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'GET',
      headers: {
        'x-user-id': 'spoofed-id',
        'x-user-role': 'superAdmin',
      },
    });

    assert.equal(res.status, 401);
  });

  test('P0 Bezpečnost: Anonymní PATCH s podvrženou rolí superAdmin vrátí 401', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'spoofed-id',
        'x-user-role': 'superAdmin',
      },
      body: JSON.stringify({ name: 'Útok' }),
    });

    assert.equal(res.status, 401);
  });

  test('P0 Bezpečnost: Nepodepsaná raw cookie vrátí 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: 'better-auth.session_token=raw-unsigned-fake-token',
      },
    });

    assert.equal(res.status, 401);
  });

  test('Člen vidí nastavení skupiny v režimu čtení bez e-mailu vlastníka', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: adamCookie,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());

    assert.equal(data.id, groupId);
    assert.equal(data.name, 'Vývojový tým Alfa');
    assert.equal(data.currentUserRole, 'member');
    assert.equal(data.permissions.canEdit, false);
    assert.equal(data.permissions.canLeaveGroup, true);
    assert.ok(data.owner);
    assert.equal(data.owner.id, terezaId);
    assert.equal('email' in data.owner, false);
  });

  test('Člen nemůže upravit nastavení skupiny (PATCH vrátí 403 Forbidden)', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adamCookie,
      },
      body: JSON.stringify({ name: 'Neoprávněná změna' }),
    });

    assert.equal(res.status, 403);
  });

  test('Nečlen skupiny dostane 403 Forbidden při pokusu o zobrazení', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: outsiderCookie,
      },
    });

    assert.equal(res.status, 403);
  });

  test('Super admin bez členství vidí plná práva i e-mail vlastníka', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: superAdminCookie,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());

    assert.equal(data.id, groupId);
    assert.equal(data.currentUserRole, null);
    assert.equal(data.permissions.canEdit, true);
    assert.ok(data.owner);
    assert.equal(data.owner.email, terezaData.email);
  });

  test('Vlastník může upravit nastavení a změny přetrvají v databázi', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const patchRes = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: terezaCookie,
      },
      body: JSON.stringify({
        name: 'Vývojový tým Alfa (Aktualizováno)',
        description: 'Nový ověřený popis skupiny',
        category: 'UI/UX Design',
        color: 'sky',
        logo: 'code',
        visibility: 'public',
      }),
    });

    assert.equal(patchRes.status, 200);
    const patchedData = groupSchema.groupSettingsResponse.parse(await patchRes.json());
    assert.equal(patchedData.name, 'Vývojový tým Alfa (Aktualizováno)');
    assert.equal(patchedData.description, 'Nový ověřený popis skupiny');
    assert.equal(patchedData.category, 'UI/UX Design');
    assert.equal(patchedData.color, 'sky');
    assert.equal(patchedData.logo, 'code');
    assert.equal(patchedData.visibility, 'public');

    // Ověření po reloadu z databáze novým GET požadavkem
    const getRes = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: terezaCookie,
      },
    });

    assert.equal(getRes.status, 200);
    const reloadedData = groupSchema.groupSettingsResponse.parse(await getRes.json());
    assert.equal(reloadedData.name, 'Vývojový tým Alfa (Aktualizováno)');
    assert.equal(reloadedData.description, 'Nový ověřený popis skupiny');
    assert.equal(reloadedData.color, 'sky');
  });

  test('Skupina bez vlastníka vrátí 200 s owner: null bez chyby validace', async (t) => {
    if (!isDbAvailable) {
      if (process.env.CI) {
        assert.fail(`Test selhal, protože DB setup selhal v CI: ${setupError?.message}`);
      }
      t.skip(`MongoDB není dostupné (${setupError?.message})`);
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${ownerlessGroupId}/settings`, {
      headers: {
        Cookie: superAdminCookie,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());
    assert.equal(data.id, ownerlessGroupId);
    assert.equal(data.owner, null);
  });
});
