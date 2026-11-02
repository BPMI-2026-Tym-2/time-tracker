import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { prisma } from '../backend/src/db/prisma.js';
import {
  checkRegistration,
  registrationMessages,
  validateRegistration,
} from '../backend/src/modules/auth/registration.js';

const tereza = {
  name: 'Tereza',
  surname: 'Nováková',
  email: 'tereza@unicorn.cz',
  password: 'heslo12345',
};

const rejected = (status: 400 | 409, message: string) => ({ ok: false, status, message });

describe('Validace registrace', () => {
  test('platný formulář projde, jména se oříznou a e-mail převede na malá písmena', () => {
    assert.deepEqual(
      validateRegistration({
        name: ' Tereza ',
        surname: ' Nováková ',
        email: ' Tereza@Unicorn.cz ',
        password: 'heslo12345',
      }),
      { ok: true, data: tereza },
    );
  });

  test('A1: hlásí všechna prázdná pole najednou, včetně polí jen z mezer', () => {
    assert.deepEqual(
      validateRegistration({ name: '', surname: '   ', email: 'adam@unicorn.cz', password: '' }),
      rejected(400, 'Pole Jméno, Příjmení, Heslo nesmí být prázdné'),
    );
  });

  test('A1: chybějící pole a neplatný vstup se berou jako prázdná', () => {
    assert.deepEqual(
      validateRegistration({ name: 42 }),
      rejected(400, 'Pole Jméno, Příjmení, E-mail, Heslo nesmí být prázdné'),
    );
    assert.deepEqual(
      validateRegistration(null),
      rejected(400, 'Pole Jméno, Příjmení, E-mail, Heslo nesmí být prázdné'),
    );
  });

  test('A2: neplatný e-mail', () => {
    for (const email of ['tereza', 'tereza@', 'tereza@unicorn', 'tereza unicorn@x.cz']) {
      assert.deepEqual(
        validateRegistration({ ...tereza, email }),
        rejected(400, registrationMessages.invalidEmail),
        email,
      );
    }
  });

  test('A1 má přednost před A2', () => {
    assert.deepEqual(
      validateRegistration({ ...tereza, name: '', email: 'tereza' }),
      rejected(400, 'Pole Jméno nesmí být prázdné'),
    );
  });
});

// Vyžaduje běžící MongoDB replica set
describe('A6: e-mail už je registrovaný (MongoDB)', () => {
  const runId = randomUUID().slice(0, 8);
  const adam = {
    id: randomUUID(),
    name: 'Adam',
    surname: 'Dvořák',
    email: `adam.${runId}@unicorn.cz`,
  };

  before(async () => {
    await prisma.user.create({ data: adam });
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { id: adam.id } });
    await prisma.$disconnect();
  });

  test('existující e-mail vrátí A6 bez ohledu na velikost písmen', async () => {
    assert.deepEqual(
      await checkRegistration({ ...adam, email: adam.email.toUpperCase(), password: 'heslo12345' }),
      rejected(409, registrationMessages.emailTaken),
    );
  });

  test('nový e-mail projde', async () => {
    const klara = {
      name: 'Klára',
      surname: 'Svobodová',
      email: `klara.${runId}@unicorn.cz`,
      password: 'heslo12345',
    };

    assert.deepEqual(await checkRegistration(klara), { ok: true, data: klara });
  });

  test('A1 má přednost před A6', async () => {
    assert.deepEqual(
      await checkRegistration({ ...adam, name: '', password: 'heslo12345' }),
      rejected(400, 'Pole Jméno nesmí být prázdné'),
    );
  });
});
