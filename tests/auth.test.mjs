import assert from 'node:assert/strict';
import test from 'node:test';
import { loginRequestSchema } from '@time-tracker/shared';
import { app } from '../backend/dist/app.js';

test('loginRequestSchema validates valid and invalid input', () => {
  const valid = loginRequestSchema.safeParse({
    email: 'test@example.com',
    password: 'password123',
  });
  assert.equal(valid.success, true);

  const invalid = loginRequestSchema.safeParse({
    email: 'invalid-email',
    password: 'password123',
  });
  assert.equal(invalid.success, false);
});

test('unauthenticated requests to /users/me and /users/:id return 401', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    const okRes = await fetch(`${baseUrl}/auth/ok`);
    assert.equal(okRes.status, 200);

    const usersMeRes = await fetch(`${baseUrl}/users/me`);
    assert.equal(usersMeRes.status, 401);

    const usersIdRes = await fetch(`${baseUrl}/users/12345`);
    assert.equal(usersIdRes.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
