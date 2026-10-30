import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { listGroupMembersQuerySchema } from '@time-tracker/shared';
import { prisma } from '../backend/src/db/prisma.js';
import { AppError } from '../backend/src/shared/errors/app-error.js';
import { listGroupMembersService } from '../backend/src/modules/groups/group.service.js';

// Vyžaduje běžící MongoDB replica set (npm run db:up). Databáze se bere z DATABASE_URL
// (výchozí z backend/.env).
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
const turistikaId = randomUUID();

const defaults = listGroupMembersQuerySchema.parse({});
const list = (requester: { id: string; role: string }, query = {}, groupId = turistikaId) =>
  listGroupMembersService(requester, groupId, { ...defaults, ...query });

async function rejectsWith(promise: Promise<unknown>, statusCode: number, message: string) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, statusCode);
    assert.equal(error.message, message);
    return true;
  });
}

describe('Seznam členů skupiny (MongoDB)', () => {
  before(async () => {
    await prisma.user.createMany({ data: users });
    await prisma.group.create({ data: { id: turistikaId, name: 'Turistika' } });
    await prisma.groupMember.createMany({
      data: [
        { groupId: turistikaId, userId: tereza.id, role: 'owner', joinedAt: new Date(2026, 9, 1) },
        { groupId: turistikaId, userId: adam.id, joinedAt: new Date(2026, 9, 2) },
        { groupId: turistikaId, userId: klara.id, joinedAt: new Date(2026, 9, 3) },
      ],
    });
  });

  after(async () => {
    await prisma.groupMember.deleteMany({ where: { groupId: turistikaId } });
    await prisma.group.deleteMany({ where: { id: turistikaId } });
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await prisma.$disconnect();
  });

  test('člen vidí všechny členy včetně sebe v pořadí vstupu, bez e-mailů', async () => {
    const result = await list(adam);

    assert.deepEqual(result.group, { id: turistikaId, name: 'Turistika' });
    assert.deepEqual(
      result.items.map((m) => [m.id, m.name, m.surname, m.role]),
      [
        [tereza.id, 'Tereza', 'Nováková', 'owner'],
        [adam.id, 'Adam', 'Dvořák', 'member'],
        [klara.id, 'Klára', 'Svobodová', 'member'],
      ],
    );
    assert.ok(result.items.every((m) => !('email' in m)));
    assert.deepEqual(result.pageInfo, { page: 1, pageSize: 20, total: 3 });
  });

  test('zakladatel skupiny vidí e-maily', async () => {
    const result = await list(tereza);

    assert.deepEqual(
      result.items.map((m) => m.email),
      [tereza.email, adam.email, klara.email],
    );
  });

  test('super admin vidí seznam s e-maily, i když není členem', async () => {
    const result = await list(superAdmin);

    assert.equal(result.pageInfo.total, 3);
    assert.deepEqual(
      result.items.map((m) => m.email),
      [tereza.email, adam.email, klara.email],
    );
  });

  test('uživatel, který není členem, dostane A1 (403)', async () => {
    await rejectsWith(list(outsider), 403, 'K zobrazení tohoto seznamu nemáte oprávnění');
  });

  test('neexistující skupina vrátí 404', async () => {
    await rejectsWith(list(superAdmin, {}, randomUUID()), 404, 'Group not found');
  });

  test('hledání podle části jména a příjmení bez ohledu na velikost písmen', async () => {
    const byName = await list(adam, { search: 'kLÁ' });
    const bySurname = await list(adam, { search: 'dvoř' });

    assert.deepEqual(
      byName.items.map((m) => m.id),
      [klara.id],
    );
    assert.deepEqual(
      bySurname.items.map((m) => m.id),
      [adam.id],
    );
    assert.equal(byName.pageInfo.total, 1);
  });

  test('podle e-mailu hledá jen zakladatel a super admin, ne člen', async () => {
    const search = `unicorn`;

    assert.equal((await list(adam, { search })).pageInfo.total, 0);
    assert.equal((await list(tereza, { search })).pageInfo.total, 3);
    assert.equal((await list(superAdmin, { search })).pageInfo.total, 3);
  });

  test('filtr podle role ve skupině', async () => {
    const owners = await list(klara, { role: 'owner' });
    const members = await list(klara, { role: 'member' });

    assert.deepEqual(
      owners.items.map((m) => m.id),
      [tereza.id],
    );
    assert.deepEqual(
      members.items.map((m) => m.id),
      [adam.id, klara.id],
    );
  });

  test('stránkování zachová pořadí a celkový počet', async () => {
    const result = await list(adam, { page: 2, pageSize: 2 });

    assert.deepEqual(
      result.items.map((m) => m.id),
      [klara.id],
    );
    assert.deepEqual(result.pageInfo, { page: 2, pageSize: 2, total: 3 });
  });
});

describe('Validace query parametrů', () => {
  test('výchozí hodnoty a převod čísel', () => {
    assert.deepEqual(listGroupMembersQuerySchema.parse({}), { page: 1, pageSize: 20 });
    assert.deepEqual(listGroupMembersQuerySchema.parse({ page: '3', pageSize: '100' }), {
      page: 3,
      pageSize: 100,
    });
  });

  test('neplatný vstup je odmítnut', () => {
    for (const query of [{ role: 'admin' }, { pageSize: '101' }, { page: '0' }, { search: '  ' }]) {
      assert.equal(
        listGroupMembersQuerySchema.safeParse(query).success,
        false,
        JSON.stringify(query),
      );
    }
  });
});
