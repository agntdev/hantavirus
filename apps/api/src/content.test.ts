import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import type pg from 'pg';
import { createContentRouter, parseContentSubmission } from './content.js';

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

async function withContentServer<T>(
  pool: pg.Pool,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/content', createContentRouter(pool));
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

const validSubmission = {
  body_markdown:
    'Draft educational copy that will remain in review until a medical expert approves the source-backed content.',
  contact_email: 'expert@example.com',
  content_type: 'article',
  credentials: 'MPH, infectious disease education reviewer',
  expert_name: 'Dr. Example Reviewer',
  source_url: 'https://www.cdc.gov/hantavirus/prevention/index.html',
  summary: 'Source-backed prevention content draft for expert review.',
  title: 'Prevention checklist draft'
};

describe('parseContentSubmission', () => {
  it('accepts source-backed expert submissions', () => {
    const parsed = parseContentSubmission(validSubmission);
    assert.equal(parsed.content_type, 'article');
    assert.equal(parsed.contact_email, 'expert@example.com');
  });

  it('rejects short or unsourced submissions', () => {
    assert.throws(() =>
      parseContentSubmission({ ...validSubmission, body_markdown: 'too short' })
    );
    assert.throws(() =>
      parseContentSubmission({ ...validSubmission, source_url: 'not-a-url' })
    );
  });
});

describe('createContentRouter', () => {
  it('lists medical content from the database', async () => {
    const item = { id: 'content-1', status: 'in_review', title: 'Draft' };
    const { calls, pool } = createMockPool([{ rows: [item] }]);

    await withContentServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/content?status=in_review`);
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(payload, { items: [item] });
      assert.match(calls[0].sql, /FROM medical_content/);
      assert.deepEqual(calls[0].params, ['in_review']);
    });
  });

  it('stores expert submissions for review', async () => {
    const created = {
      created_at: '2026-05-12T17:00:00.000Z',
      id: 'content-2',
      slug: 'prevention-checklist-draft-12345678',
      status: 'in_review'
    };
    const { calls, pool } = createMockPool([{ rows: [created] }]);

    await withContentServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/content/submissions`, {
        body: JSON.stringify(validSubmission),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const payload = await response.json();

      assert.equal(response.status, 201);
      assert.deepEqual(payload, created);
      assert.match(calls[0].sql, /INSERT INTO medical_content/);
      assert.match(String(calls[0].params?.[2]), /^prevention-checklist-draft-/);
      assert.match(String(calls[0].params?.[6]), /medical_review_required/);
    });
  });
});
