import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const OAUTH_PROVIDERS = ['email', 'facebook', 'github', 'google'] as const;
const SESSION_TTL_DAYS = 30;

export const registerSchema = z.object({
  display_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(256)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(256)
});

export const oauthLoginSchema = z.object({
  display_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  provider: z.enum(OAUTH_PROVIDERS),
  provider_user_id: z.string().trim().min(2).max(300)
});

type AuthUser = {
  display_name: string;
  email: string;
  id: string;
  password_hash?: string | null;
  role: string;
};

function publicUser(user: AuthUser) {
  return {
    display_name: user.display_name,
    email: user.email,
    id: user.id,
    role: user.role
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  const [, salt, hash] = storedHash?.split('$') ?? [];
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function createSession(pool: pg.Pool, userId: string) {
  const token = randomUUID() + randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await pool.query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, expires_at`,
    [userId, hashSessionToken(token), expiresAt]
  );

  return { ...rows[0], token };
}

export function createAuthRouter(pool: pg.Pool): Router {
  const router = Router();

  router.post('/register', async (request, response) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'invalid_registration' });
      return;
    }

    const input = parsed.data;
    const { rows } = await pool.query<AuthUser>(
      `INSERT INTO users (email, display_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, role`,
      [input.email, input.display_name, hashPassword(input.password)]
    );
    const session = await createSession(pool, rows[0].id);
    response.status(201).json({ session, user: publicUser(rows[0]) });
  });

  router.post('/login', async (request, response) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'invalid_login' });
      return;
    }

    const { rows } = await pool.query<AuthUser>(
      `SELECT id, email, display_name, role, password_hash
         FROM users
        WHERE email = $1`,
      [parsed.data.email]
    );
    const user = rows[0];
    if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
      response.status(401).json({ error: 'invalid_credentials' });
      return;
    }

    const session = await createSession(pool, user.id);
    response.json({ session, user: publicUser(user) });
  });

  router.post('/oauth', async (request, response) => {
    const parsed = oauthLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'invalid_oauth_login' });
      return;
    }

    const input = parsed.data;
    const userResult = await pool.query<AuthUser>(
      `INSERT INTO users (email, display_name, email_verified_at)
       VALUES ($1, $2, now())
       ON CONFLICT (email) DO UPDATE
          SET display_name = EXCLUDED.display_name,
              email_verified_at = COALESCE(users.email_verified_at, now())
       RETURNING id, email, display_name, role`,
      [input.email, input.display_name]
    );
    const user = userResult.rows[0];
    await pool.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_user_id) DO UPDATE
          SET user_id = EXCLUDED.user_id`,
      [user.id, input.provider, input.provider_user_id]
    );
    const session = await createSession(pool, user.id);
    response.json({ session, user: publicUser(user) });
  });

  router.get('/profile', async (request, response) => {
    const token = request.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) {
      response.status(401).json({ error: 'missing_session' });
      return;
    }

    const { rows } = await pool.query<AuthUser>(
      `SELECT u.id, u.email, u.display_name, u.role
         FROM user_sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1
          AND s.expires_at > now()`,
      [hashSessionToken(token)]
    );
    if (!rows[0]) {
      response.status(401).json({ error: 'invalid_session' });
      return;
    }

    response.json({ user: publicUser(rows[0]) });
  });

  return router;
}
