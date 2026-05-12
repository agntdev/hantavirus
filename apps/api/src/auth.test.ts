import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import type pg from 'pg';
import { createAuthRouter, hashPassword, verifyPassword } from './auth.js';

type QueryCall = { params?: unknown[]; sql: string };
type QueryResult = { rows: unknown[] };

function createMockPool(results: QueryResult[] = []) {
  const calls: QueryCall[] = [];
  const pool = {
    async query(sql: string, params?: unknown[]) {
      calls.push({ params, sql });
      return results.shift() ?? { rows: [] };
    }
  } as unknown as pg.Pool;

  return { calls, pool };
}

async function withAuthServer<T>(
  pool: pg.Pool,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/auth', createAuthRouter(pool));
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo | null;
  assert.ok(address);

  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

const user = {
  display_name: 'Reader Example',
  email: 'reader@example.com',
  id: '083b8f64-4db2-4f4b-b87d-01c7798f14c1',
  role: 'member'
};
const session = {
  expires_at: '2026-06-11T18:00:00.000Z',
  id: 'session-1'
};

describe('password hashing', () => {
  it('hashes and verifies passwords with scrypt', () => {
    const hash = hashPassword('very-secure-password');

    assert.equal(hash.startsWith('scrypt$'), true);
    assert.equal(verifyPassword('very-secure-password', hash), true);
    assert.equal(verifyPassword('wrong-password', hash), false);
  });
});

describe('createAuthRouter', () => {
  it('registers email/password users and creates sessions', async () => {
    const { calls, pool } = createMockPool([{ rows: [user] }, { rows: [session] }]);

    await withAuthServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/register`, {
        body: JSON.stringify({
          display_name: 'Reader Example',
          email: 'Reader@Example.com',
          password: 'very-secure-password'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const payload = (await response.json()) as {
        session: { token: string };
        user: { email: string };
      };

      assert.equal(response.status, 201);
      assert.equal(payload.user.email, 'reader@example.com');
      assert.equal(typeof payload.session.token, 'string');
      assert.match(calls[0].sql, /INSERT INTO users/);
      assert.match(String(calls[0].params?.[2]), /^scrypt\$/);
      assert.match(calls[1].sql, /INSERT INTO user_sessions/);
    });
  });

  it('logs in users with valid password hashes', async () => {
    const passwordHash = hashPassword('very-secure-password');
    const { calls, pool } = createMockPool([
      { rows: [{ ...user, password_hash: passwordHash }] },
      { rows: [session] }
    ]);

    await withAuthServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        body: JSON.stringify({
          email: 'reader@example.com',
          password: 'very-secure-password'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      assert.equal(response.status, 200);
      assert.match(calls[0].sql, /SELECT id, email/);
      assert.match(calls[1].sql, /INSERT INTO user_sessions/);
    });
  });

  it('links OAuth accounts and creates sessions', async () => {
    const { calls, pool } = createMockPool([
      { rows: [user] },
      { rows: [] },
      { rows: [session] }
    ]);

    await withAuthServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/oauth`, {
        body: JSON.stringify({
          display_name: 'Reader Example',
          email: 'reader@example.com',
          provider: 'google',
          provider_user_id: 'google-reader-1'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      assert.equal(response.status, 200);
      assert.match(calls[0].sql, /ON CONFLICT \(email\)/);
      assert.match(calls[1].sql, /INSERT INTO oauth_accounts/);
      assert.match(calls[2].sql, /INSERT INTO user_sessions/);
    });
  });

  it('returns profile data for valid bearer sessions', async () => {
    const { calls, pool } = createMockPool([{ rows: [user] }]);

    await withAuthServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/profile`, {
        headers: { authorization: 'Bearer session-token' }
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(payload, { user });
      assert.match(calls[0].sql, /JOIN users/);
      assert.equal(String(calls[0].params?.[0]).length, 64);
    });
  });
});
