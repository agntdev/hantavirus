import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL
});

export async function checkDatabase() {
  const result = await pool.query<{ ok: number }>('select 1 as ok');
  return result.rows[0]?.ok === 1;
}
