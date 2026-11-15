import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { app } from '../backend/src/app.js';
import { env } from '../backend/src/config/env.js';
import { prisma } from '../backend/src/db/prisma.js';
import { registrationMessages } from '../backend/src/modules/auth/auth.messages.js';
import { validateRegistration } from '../backend/src/modules/auth/auth.service.js';

const tereza = {
  name: 'Tereza',
  surname: 'Nováková',
  email: 'tereza@unicorn.cz',
  password: 'heslo12345',
};

const rejected = (status: 400, message: string) => ({ ok: false, status, message });

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
describe('POST /api/auth/sign-up/email (MongoDB)', () => {
  const runId = randomUUID().slice(0, 8);
  const adam = {
    id: randomUUID(),
    name: 'Adam',
    surname: 'Dvořák',
    email: `adam.${runId}@unicorn.cz`,
  };
  let server: Server;
  let signUpUrl: string;

  const signUp = (body: Record<string, unknown>) =>
    fetch(signUpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: env.corsOrigin },
      body: JSON.stringify(body),
    });

  before(async () => {
    await prisma.user.create({ data: adam });
    server = app.listen(0);
    await once(server, 'listening');
    const { port } = server.address() as AddressInfo;
    signUpUrl = `http://127.0.0.1:${port}/api/auth/sign-up/email`;
  });

  after(async () => {
    server.close();
    await once(server, 'close');
    await prisma.user.deleteMany({ where: { id: adam.id } });
    await prisma.$disconnect();
  });

  test('A6: existující e-mail vrátí 409 a českou hlášku bez ohledu na velikost písmen', async () => {
    const response = await signUp({
      name: 'Adam',
      surname: 'Dvořák',
      email: adam.email.toUpperCase(),
      password: 'heslo12345',
    });

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
      code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
      message: registrationMessages.emailTaken,
    });
    assert.equal(await prisma.user.count({ where: { email: adam.email } }), 1);
  });

  test('A1: prázdné pole vrátí 400 a českou hlášku', async () => {
    const response = await signUp({
      name: '',
      surname: 'Dvořák',
      email: adam.email,
      password: 'heslo12345',
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      code: 'INVALID_REGISTRATION',
      message: 'Pole Jméno nesmí být prázdné',
    });
  });
});
