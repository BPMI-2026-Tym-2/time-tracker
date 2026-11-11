process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import type { Prisma } from '@prisma/client';
import { groupSchema } from '@time-tracker/shared';
import { app } from '../backend/src/app.js';
import { auth } from '../backend/src/modules/auth/auth.config.js';
import type { GroupSettingsRecord } from '../backend/src/modules/groups/group.repository.js';
import groupRepository from '../backend/src/modules/groups/group.repository.js';

// Testovací mock uživatelé
const terezaUser = {
  id: randomUUID(),
  name: 'Tereza',
  surname: 'Nováková',
  email: 'tereza.novakova@unicorn.cz',
  role: 'user',
};

const adamUser = {
  id: randomUUID(),
  name: 'Adam',
  surname: 'Dvořák',
  email: 'adam.dvorak@unicorn.cz',
  role: 'user',
};

const outsiderUser = {
  id: randomUUID(),
  name: 'Petr',
  surname: 'Černý',
  email: 'petr.cerny@unicorn.cz',
  role: 'user',
};

const superAdminUser = {
  id: randomUUID(),
  name: 'Super',
  surname: 'Admin',
  email: 'admin@unicorn.cz',
  role: 'superAdmin',
};

const groupId = randomUUID();
const ownerlessGroupId = randomUUID();

// Mock session tokeny
const terezaCookie = 'better-auth.session_token=token-tereza';
const adamCookie = 'better-auth.session_token=token-adam';
const outsiderCookie = 'better-auth.session_token=token-outsider';
const superAdminCookie = 'better-auth.session_token=token-superadmin';

const sessions: Record<string, typeof terezaUser> = {
  'token-tereza': terezaUser,
  'token-adam': adamUser,
  'token-outsider': outsiderUser,
  'token-superadmin': superAdminUser,
};

// Výchozí mock data skupin
let mockGroup: GroupSettingsRecord;
let mockOwnerlessGroup: GroupSettingsRecord;

function resetMockData() {
  mockGroup = {
    id: groupId,
    name: 'Vývojový tým Alfa',
    description: 'Původní popis skupiny',
    category: 'Vývoj aplikací',
    color: 'blue',
    logo: 'rocket',
    visibility: 'private',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    members: [
      {
        role: 'owner',
        user: {
          id: terezaUser.id,
          name: terezaUser.name,
          surname: terezaUser.surname,
          email: terezaUser.email,
        },
      },
    ],
    _count: {
      members: 2,
    },
  };

  mockOwnerlessGroup = {
    id: ownerlessGroupId,
    name: 'Skupina bez vlastníka',
    description: null,
    category: null,
    color: null,
    logo: null,
    visibility: 'public',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    members: [],
    _count: {
      members: 0,
    },
  };
}

let server: Server;
let baseUrl: string;
const originalGetSession = auth.api.getSession;
const originalFindSettingsById = groupRepository.findSettingsById;
const originalFindMembership = groupRepository.findMembership;
const originalUpdateSettingsById = groupRepository.updateSettingsById;

describe('Nastavení skupiny – HTTP & Bezpečnost (s Mock DB)', () => {
  before(async () => {
    resetMockData();

    // Mock autentizačního resolveru Better Auth: simuluje ověření session cookie
    (auth.api as unknown as { getSession: typeof auth.api.getSession }).getSession = (async ({
      headers,
    }: {
      headers: Headers;
    }) => {
      const cookieHeader = headers.get('cookie') ?? '';
      const match = cookieHeader.match(/better-auth\.session_token=([a-zA-Z0-9_-]+)/);
      if (!match) return null;

      const token = match[1];
      const user = sessions[token];
      if (!user) return null;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        session: {
          id: randomUUID(),
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 86400000),
        },
      } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;
    }) as unknown as typeof auth.api.getSession;

    // Mock databázových metod repozitáře (in-memory mock DB)
    groupRepository.findSettingsById = async (id: string) => {
      if (id === groupId) return { ...mockGroup };
      if (id === ownerlessGroupId) return { ...mockOwnerlessGroup };
      return null;
    };

    groupRepository.findMembership = async (gId: string, uId: string) => {
      if (gId === groupId) {
        if (uId === terezaUser.id) return { role: 'owner' };
        if (uId === adamUser.id) return { role: 'member' };
      }
      return null;
    };

    groupRepository.updateSettingsById = async (id: string, data: Prisma.GroupUpdateInput) => {
      if (id === groupId) {
        mockGroup = {
          ...mockGroup,
          ...(data as Partial<GroupSettingsRecord>),
          updatedAt: new Date(),
        };
        return { ...mockGroup };
      }
      return null;
    };

    // Spuštění testovacího HTTP serveru
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Obnovení původních metod
    auth.api.getSession = originalGetSession;
    groupRepository.findSettingsById = originalFindSettingsById;
    groupRepository.findMembership = originalFindMembership;
    groupRepository.updateSettingsById = originalUpdateSettingsById;

    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
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

  test('P0 Bezpečnost: Nepodepsaná nebo neplatná cookie vrátí 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: 'better-auth.session_token=raw-unsigned-fake-token',
      },
    });

    assert.equal(res.status, 401);
  });

  test('Člen vidí nastavení skupiny v režimu čtení bez e-mailu vlastníka', async () => {
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
    assert.equal(data.owner.id, terezaUser.id);
    assert.equal('email' in data.owner, false);
  });

  test('Člen nemůže upravit nastavení skupiny (PATCH vrátí 403 Forbidden)', async () => {
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

  test('Nečlen skupiny dostane 403 Forbidden při pokusu o zobrazení', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: outsiderCookie,
      },
    });

    assert.equal(res.status, 403);
  });

  test('Super admin bez členství vidí plná práva i e-mail vlastníka', async () => {
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
    assert.equal(data.owner.email, terezaUser.email);
  });

  test('Vlastník může upravit nastavení a změny přetrvají po uložení', async () => {
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

    // Ověření novým GET požadavkem
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

  test('Skupina bez vlastníka vrátí 200 s owner: null bez chyby validace', async () => {
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

  test('P2 Validace: PATCH s názvem tvořeným pouze mezerami vrátí 400', async () => {
    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: terezaCookie,
      },
      body: JSON.stringify({
        name: '    ',
      }),
    });

    assert.equal(res.status, 400);
  });

  test('P2 Normalizace: Starší záznamy s Vývoj a blue jsou v mapperu normalizovány na Obecná a blue-sky', async () => {
    mockGroup.category = 'Vývoj';
    mockGroup.color = 'blue';
    mockGroup.description = null;

    const res = await fetch(`${baseUrl}/groups/${groupId}/settings`, {
      headers: {
        Cookie: terezaCookie,
      },
    });

    assert.equal(res.status, 200);
    const data = groupSchema.groupSettingsResponse.parse(await res.json());
    assert.equal(data.category, 'Obecná');
    assert.equal(data.color, 'blue-sky');
    assert.equal(data.description, null);
  });
});
