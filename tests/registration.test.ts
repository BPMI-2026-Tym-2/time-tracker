import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { isAPIError } from 'better-auth/api';
import { app } from '../backend/src/app.js';
import { env } from '../backend/src/config/env.js';
import { prisma } from '../backend/src/db/prisma.js';
import authService from '../backend/src/modules/auth/auth.service.js';

const password = 'Heslo12345!';

const tereza = {
  name: 'Tereza',
  surname: 'Nováková',
  email: 'tereza@unicorn.cz',
  password,
};

describe('Normalizace a validace registrace', () => {
  test('ořízne jméno, příjmení a e-mail a e-mail převede na malá písmena', () => {
    assert.deepEqual(
      authService.parseRegistrationInput({
        name: ' Tereza ',
        surname: ' Nováková ',
        email: ' Tereza@Unicorn.CZ ',
        password,
      }),
      tereza,
    );
  });

  test('prázdné jméno (jen mezery) vyhodí APIError s kódem INVALID_REGISTRATION', () => {
    assert.throws(
      () => authService.parseRegistrationInput({ ...tereza, name: '   ' }),
      (error: unknown) =>
        isAPIError(error) &&
        error.body?.code === 'INVALID_REGISTRATION' &&
        error.body?.message === 'Jméno je povinné.',
    );
  });

  test('heslo bez velkého písmene vyhodí APIError', () => {
    assert.throws(
      () => authService.parseRegistrationInput({ ...tereza, password: 'heslo12345!' }),
      (error: unknown) => isAPIError(error) && error.body?.code === 'INVALID_REGISTRATION',
    );
  });

  test('heslo s mezerou je odmítnuto', () => {
    assert.throws(
      () => authService.parseRegistrationInput({ ...tereza, password: 'Heslo 12345!' }),
      (error: unknown) => isAPIError(error) && error.body?.code === 'INVALID_REGISTRATION',
    );
  });

  test('heslo s českými písmeny a speciálním znakem projde', () => {
    assert.equal(
      authService.parseRegistrationInput({ ...tereza, password: 'Čůřák2024?' }).password,
      'Čůřák2024?',
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
  const newUserEmail = `nova.${runId}@unicorn.cz`;
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
    await prisma.session.deleteMany({
      where: { user: { email: { in: [adam.email, newUserEmail] } } },
    });
    await prisma.account.deleteMany({
      where: { user: { email: { in: [adam.email, newUserEmail] } } },
    });
    await prisma.user.deleteMany({ where: { email: { in: [adam.email, newUserEmail] } } });
    await prisma.$disconnect();
  });

  test('úspěšná registrace uloží e-mail malými písmeny a ořezaná jména', async () => {
    const response = await signUp({
      name: '  Nová  ',
      surname: ' Uživatelka ',
      email: `  ${newUserEmail.toUpperCase()}  `,
      password,
    });

    assert.equal(response.status, 200);

    const user = await prisma.user.findUnique({ where: { email: newUserEmail } });
    assert.ok(user, 'uživatel byl vytvořen');
    assert.equal(user.name, 'Nová');
    assert.equal(user.surname, 'Uživatelka');
    assert.equal(user.role, 'user');
  });

  test('existující e-mail (jinak napsaný) nevytvoří druhý účet', async () => {
    const response = await signUp({
      name: 'Adam',
      surname: 'Dvořák',
      email: adam.email.toUpperCase(),
      password,
    });

    assert.ok(!response.ok, `očekávána chyba, dostáno ${response.status}`);
    assert.equal(await prisma.user.count({ where: { email: adam.email } }), 1);
  });

  test('prázdné jméno vrátí 400 a českou hlášku', async () => {
    const response = await signUp({
      name: '',
      surname: 'Dvořák',
      email: `prazdne.${runId}@unicorn.cz`,
      password,
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      code: 'INVALID_REGISTRATION',
      message: 'Jméno je povinné.',
    });
  });

  test('slabé heslo vrátí 400 a nevytvoří účet', async () => {
    const email = `slabe.${runId}@unicorn.cz`;
    const response = await signUp({
      name: 'Tereza',
      surname: 'Nováková',
      email,
      password: 'heslo12345',
    });

    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, 'INVALID_REGISTRATION');
    assert.equal(await prisma.user.count({ where: { email } }), 0);
  });
});
