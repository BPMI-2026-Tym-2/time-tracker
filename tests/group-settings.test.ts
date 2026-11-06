import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { groupSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { prisma } from '../backend/src/db/prisma.js';

const runId = randomUUID().slice(0, 8);
const testUser = (name: string, surname: string, role = 'user') => ({
  id: randomUUID(),
  name,
  surname,
  email: `${name.toLowerCase()}.${runId}@unicorn.cz`,
  emailVerified: true,
  role,
});

const tereza = testUser('Tereza', 'Nováková');
const adam = testUser('Adam', 'Dvořák');
const outsider = testUser('Petr', 'Černý');
const superAdmin = testUser('Super', 'Admin', 'superAdmin');
const users = [tereza, adam, outsider, superAdmin];

const groupId = randomUUID();
const ownerlessGroupId = randomUUID();

// Session tokeny pro jednotlivé uživatele
const tokens = {
  tereza: randomUUID(),
  adam: randomUUID(),
  outsider: randomUUID(),
  superAdmin: randomUUID(),
};

let server: Server;
let baseUrl: string;
let isDbAvailable = false;

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

    // Kontrola a inicializace databáze pro testy
    try {
      await prisma.$connect();

      for (const u of users) {
        await prisma.user.create({ data: u });
      }

      // Vytvoření platných Better Auth sessions v databázi
      const sessionEntries = [
        { id: randomUUID(), userId: tereza.id, token: tokens.tereza },
        { id: randomUUID(), userId: adam.id, token: tokens.adam },
        { id: randomUUID(), userId: outsider.id, token: tokens.outsider },
        { id: randomUUID(), userId: superAdmin.id, token: tokens.superAdmin },
      ];

      for (const s of sessionEntries) {
        await prisma.session.create({
          data: {
            ...s,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        });
      }

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

      // Skupina bez vlastníka (testování explicitního owner: null)
      await prisma.group.create({
        data: {
          id: ownerlessGroupId,
          name: 'Skupina bez vlastníka',
        },
      });

      await prisma.groupMember.create({
        data: { groupId, userId: tereza.id, role: 'owner', joinedAt: new Date(2026, 9, 1) },
      });
      await prisma.groupMember.create({
        data: { groupId, userId: adam.id, role: 'member', joinedAt: new Date(2026, 9, 2) },
      });

      isDbAvailable = true;
    } catch {
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
        await prisma.session.deleteMany({ where: { token: { in: Object.values(tokens) } } });
        await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
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
        'x-user-id': superAdmin.id,
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
        'x-user-id': superAdmin.id,
        'x-user-role': 'superAdmin',
      },
      body: JSON.stringify({ name: 'Útok' }),
    });

    assert.equal(res.status, 401);
  });

  test('Člen vidí nastavení skupiny v režimu čtení bez e-mailu vlastníka', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: `better-auth.session_token=${tokens.adam}`,
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
    assert.equal(data.owner.id, tereza.id);
    assert.equal('email' in data.owner, false);
  });

  test('Člen nemůže upravit nastavení skupiny (PATCH vrátí 403 Forbidden)', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `better-auth.session_token=${tokens.adam}`,
      },
      body: JSON.stringify({ name: 'Neoprávněná změna' }),
    });

    assert.equal(res.status, 403);
  });

  test('Nečlen skupiny dostane 403 Forbidden při pokusu o zobrazení', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: `better-auth.session_token=${tokens.outsider}`,
      },
    });

    assert.equal(res.status, 403);
  });

  test('Super admin bez členství vidí plná práva i e-mail vlastníka', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: `better-auth.session_token=${tokens.superAdmin}`,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());

    assert.equal(data.id, groupId);
    assert.equal(data.currentUserRole, null);
    assert.equal(data.permissions.canEdit, true);
    assert.ok(data.owner);
    assert.equal(data.owner.email, tereza.email);
  });

  test('Vlastník může upravit nastavení a změny přetrvají v databázi', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }

    const patchRes = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `better-auth.session_token=${tokens.tereza}`,
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
        Cookie: `better-auth.session_token=${tokens.tereza}`,
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
      t.skip('MongoDB není dostupné');
      return;
    }

    const res = await fetch(`${baseUrl}/groups/${ownerlessGroupId}/settings`, {
      headers: {
        Cookie: `better-auth.session_token=${tokens.superAdmin}`,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());
    assert.equal(data.id, ownerlessGroupId);
    assert.equal(data.owner, null);
  });
});
