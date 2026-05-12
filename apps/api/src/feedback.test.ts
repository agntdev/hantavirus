import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import type pg from 'pg';
import { createFeedbackRouter, parseFeedbackInput } from './feedback.js';

type QueryCall = {
  params?: unknown[];
  sql: string;
};

type QueryResult = {
  rows: unknown[];
};

function createMockPool(results: QueryResult[] = []) {
  const calls: QueryCall[] = [];

  const pool = {
    async query(sql: string, params?: unknown[]) {
      calls.push({ params, sql });
      const next = results.shift();
      return next ?? { rows: [] };
    }
  } as unknown as pg.Pool;

  return { calls, pool };
}

async function withFeedbackServer<T>(
  pool: pg.Pool,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/feedback', createFeedbackRouter(pool));

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

describe('parseFeedbackInput', () => {
  const baseInput = {
    body: 'The outbreak map is missing region labels in the legend.',
    category: 'usability',
    subject: 'Outbreak map legend is hard to read'
  };

  it('accepts a minimal valid payload', () => {
    const parsed = parseFeedbackInput(baseInput);
    assert.equal(parsed.body, baseInput.body);
    assert.equal(parsed.category, 'usability');
    assert.equal(parsed.subject, baseInput.subject);
    assert.equal(parsed.contact_email, undefined);
  });

  it('trims surrounding whitespace from text fields', () => {
    const parsed = parseFeedbackInput({
      ...baseInput,
      body: '  body with padding  ',
      subject: '  padded subject  '
    });
    assert.equal(parsed.subject, 'padded subject');
    assert.equal(parsed.body, 'body with padding');
  });

  it('rejects blank subject', () => {
    assert.throws(() => parseFeedbackInput({ ...baseInput, subject: '   ' }));
  });

  it('rejects blank body', () => {
    assert.throws(() => parseFeedbackInput({ ...baseInput, body: '' }));
  });

  it('rejects unknown category values', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, category: 'praise' })
    );
  });

  it('rejects malformed contact email', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, contact_email: 'not-an-email' })
    );
  });

  it('rejects malformed page url', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, page_url: 'not a url' })
    );
  });

  it('accepts every documented category', () => {
    for (const category of [
      'bug',
      'content_request',
      'content_correction',
      'usability',
      'general'
    ] as const) {
      const parsed = parseFeedbackInput({ ...baseInput, category });
      assert.equal(parsed.category, category);
    }
  });

  it('caps body length at 5000 characters', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, body: 'x'.repeat(5001) })
    );
  });
});

describe('createFeedbackRouter', () => {
  it('returns 400 and skips the database for invalid feedback', async () => {
    const { calls, pool } = createMockPool();

    await withFeedbackServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/feedback`, {
        body: JSON.stringify({ body: 'Missing category and subject' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const payload = (await response.json()) as {
        error: string;
        issues: unknown[];
      };

      assert.equal(response.status, 400);
      assert.equal(payload.error, 'invalid_feedback');
      assert.ok(payload.issues.length >= 1);
      assert.equal(calls.length, 0);
    });
  });

  it('stores valid feedback with normalized optional fields', async () => {
    const created = {
      created_at: '2026-05-12T15:00:00.000Z',
      id: 'feedback-1',
      status: 'new'
    };
    const { calls, pool } = createMockPool([{ rows: [created] }]);

    await withFeedbackServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/feedback`, {
        body: JSON.stringify({
          body: '  Add a prevention checklist for field workers.  ',
          category: 'content_request',
          contact_email: 'reader@example.com',
          page_url: 'https://example.com/prevention',
          subject: '  Field worker checklist  '
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const payload = await response.json();

      assert.equal(response.status, 201);
      assert.deepEqual(payload, created);
      assert.equal(calls.length, 1);
      assert.match(calls[0].sql, /INSERT INTO user_feedback/);
      assert.deepEqual(calls[0].params, [
        null,
        'reader@example.com',
        'content_request',
        'Field worker checklist',
        'Add a prevention checklist for field workers.',
        'https://example.com/prevention'
      ]);
    });
  });

  it('summarizes feedback counts and recent submissions', async () => {
    const recent = {
      category: 'bug',
      created_at: '2026-05-12T15:00:00.000Z',
      id: 'feedback-1',
      status: 'new',
      subject: 'Broken link'
    };
    const { calls, pool } = createMockPool([
      { rows: [{ category: 'bug', count: '2' }] },
      { rows: [{ count: '2', status: 'new' }] },
      { rows: [{ total: '2' }] },
      { rows: [recent] }
    ]);

    await withFeedbackServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/feedback/summary`);
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(payload, {
        by_category: [{ category: 'bug', count: 2 }],
        by_status: [{ count: 2, status: 'new' }],
        recent: [recent],
        total: 2
      });
      assert.equal(calls.length, 4);
      assert.match(calls[0].sql, /GROUP BY category/);
      assert.match(calls[1].sql, /GROUP BY status/);
      assert.match(calls[2].sql, /count\(\*\)::text AS total/);
      assert.match(calls[3].sql, /ORDER BY created_at DESC/);
    });
  });
});
