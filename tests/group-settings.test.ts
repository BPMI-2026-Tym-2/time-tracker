import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { prisma } from '../backend/src/db/prisma.js';
import { AppError } from '../backend/src/shared/errors/app-error.js';
import groupService from '../backend/src/modules/groups/group.service.js';

const runId = randomUUID().slice(0, 8);
const user = (name: string, surname: string, role = 'user') => ({
  id: randomUUID(),
  name,
  surname,
  email: `${name.toLowerCase()}.${runId}@unicorn.cz`,
  role,
});

const tereza = user('Tereza', 'Nováková');
const adam = user('Adam', 'Dvořák');
const klara = user('Klára', 'Svobodová');
const outsider = user('Petr', 'Černý');
const superAdmin = user('Super', 'Admin', 'superAdmin');
const users = [tereza, adam, klara, outsider, superAdmin];
const groupId = randomUUID();

const getSettings = (requester: { id: string; role: string }, gId = groupId) =>
  groupService.getSettings(requester, gId);

async function rejectsWith(promise: Promise<unknown>, statusCode: number, message: string) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, statusCode);
    assert.equal(error.message, message);
    return true;
  });
}

let isDbAvailable = false;

describe('Zobrazit nastavení skupiny (MongoDB)', () => {
  before(async () => {
    try {
      await prisma.$connect();
      for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { id: u.id } });
        if (!existing) {
          await prisma.user.create({ data: u });
        }
      }
      const existingGroup = await prisma.group.findUnique({ where: { id: groupId } });
      if (!existingGroup) {
        await prisma.group.create({ data: { id: groupId, name: 'Vývojový tým' } });
      }
      const members = [
        { groupId, userId: tereza.id, role: 'owner' as const, joinedAt: new Date(2026, 9, 1) },
        { groupId, userId: adam.id, role: 'member' as const, joinedAt: new Date(2026, 9, 2) },
        { groupId, userId: klara.id, role: 'member' as const, joinedAt: new Date(2026, 9, 3) },
      ];
      for (const m of members) {
        const existing = await prisma.groupMember.findFirst({
          where: { groupId: m.groupId, userId: m.userId },
        });
        if (!existing) {
          await prisma.groupMember.create({ data: m });
        }
      }
      isDbAvailable = true;
    } catch {
      isDbAvailable = false;
    }
  });

  after(async () => {
    if (!isDbAvailable) {
      await prisma.$disconnect().catch(() => {});
      return;
    }
    try {
      await prisma.groupMember.deleteMany({ where: { groupId } });
      await prisma.group.deleteMany({ where: { id: groupId } });
      await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
      await prisma.$disconnect();
    } catch {
      // Ignorovat chybu při úklidu
    }
  });

  test('člen vidí nastavení skupiny a základní údaje o vlastníkovi bez e-mailu', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    const result = await getSettings(adam);

    assert.equal(result.id, groupId);
    assert.equal(result.name, 'Vývojový tým');
    assert.equal(result.membersCount, 3);
    assert.equal(result.currentUserRole, 'member');
    assert.deepEqual(result.owner, {
      id: tereza.id,
      name: 'Tereza',
      surname: 'Nováková',
    });
    assert.equal('email' in result.owner, false);
    assert.deepEqual(result.permissions, {
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canLeaveGroup: true,
    });
  });

  test('zakladatel (vlastník) vidí nastavení, svůj e-mail a plná práva ke správě', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    const result = await getSettings(tereza);

    assert.equal(result.id, groupId);
    assert.equal(result.currentUserRole, 'owner');
    assert.equal(result.owner.email, tereza.email);
    assert.deepEqual(result.permissions, {
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      canLeaveGroup: false,
    });
  });

  test('super admin vidí nastavení i s e-mailem a právy, i když není členem', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    const result = await getSettings(superAdmin);

    assert.equal(result.id, groupId);
    assert.equal(result.currentUserRole, null);
    assert.equal(result.owner.email, tereza.email);
    assert.deepEqual(result.permissions, {
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      canLeaveGroup: false,
    });
  });

  test('nečlen skupiny dostane 403 Forbidden', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    await rejectsWith(
      getSettings(outsider),
      403,
      'K zobrazení nastavení této skupiny nemáte oprávnění',
    );
  });

  test('neexistující skupina vrátí 404 Not Found', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    await rejectsWith(getSettings(superAdmin, randomUUID()), 404, 'Group not found');
  });

  test('vlastník může upravit nastavení skupiny (popisek, barva, logo)', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    const updated = await groupService.updateSettings(tereza, groupId, {
      name: 'Vývojový tým (Aktualizováno)',
      description: 'Nový popisek skupiny pro test.',
      color: 'blue',
      logo: 'zap',
      category: 'UI/UX Design',
    });

    assert.equal(updated.name, 'Vývojový tým (Aktualizováno)');
    assert.equal(updated.description, 'Nový popisek skupiny pro test.');
    assert.equal(updated.color, 'blue');
    assert.equal(updated.logo, 'zap');
    assert.equal(updated.category, 'UI/UX Design');
  });

  test('běžný člen nemůže upravit nastavení skupiny a dostane 403', async (t) => {
    if (!isDbAvailable) {
      t.skip('MongoDB není dostupné');
      return;
    }
    await rejectsWith(
      groupService.updateSettings(adam, groupId, { name: 'Útok' }),
      403,
      'K úpravě nastavení této skupiny nemáte oprávnění',
    );
  });
});
