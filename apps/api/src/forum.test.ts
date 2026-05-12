import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import type pg from 'pg';
import { createForumRouter, parseReplyInput, parseThreadInput } from './forum.js';

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

async function withForumServer<T>(
  pool: pg.Pool,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/forum', createForumRouter(pool));
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

const threadId = '083b8f64-4db2-4f4b-b87d-01c7798f14c1';
const userId = 'eb89fa35-8ec0-41f4-b353-242b7f32db55';

describe('forum input parsing', () => {
  it('accepts normal threads and replies', () => {
    assert.equal(
      parseThreadInput({ body_markdown: 'How should I read this update?', title: 'Update help' })
        .title,
      'Update help'
    );
    assert.equal(parseReplyInput({ body_markdown: 'Please check the linked guidance.' }).body_markdown, 'Please check the linked guidance.');
  });

  it('rejects spam-like forum posts', () => {
    assert.throws(() =>
      parseReplyInput({ body_markdown: 'https://a.test https://b.test https://c.test https://d.test' })
    );
  });
});

describe('createForumRouter', () => {
  it('lists and creates threads', async () => {
    const thread = { id: threadId, status: 'open', title: 'Update help' };
    const { calls, pool } = createMockPool([{ rows: [thread] }, { rows: [thread] }]);

    await withForumServer(pool, async (baseUrl) => {
      const listResponse = await fetch(`${baseUrl}/forum/threads?status=open`);
      assert.deepEqual(await listResponse.json(), { threads: [thread] });

      const createResponse = await fetch(`${baseUrl}/forum/threads`, {
        body: JSON.stringify({
          author_id: userId,
          body_markdown: 'I need help understanding the latest content update.',
          title: 'Content update question'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      assert.equal(createResponse.status, 201);
      assert.match(calls[0].sql, /FROM forum_threads/);
      assert.match(calls[1].sql, /INSERT INTO forum_threads/);
    });
  });

  it('creates replies and stores interactions', async () => {
    const reply = { id: 'reply-1', thread_id: threadId };
    const { calls, pool } = createMockPool([{ rows: [reply] }, { rows: [] }, { rows: [] }]);

    await withForumServer(pool, async (baseUrl) => {
      const replyResponse = await fetch(`${baseUrl}/forum/threads/${threadId}/posts`, {
        body: JSON.stringify({ author_id: userId, body_markdown: 'This is useful context.' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const voteResponse = await fetch(`${baseUrl}/forum/threads/${threadId}/votes`, {
        body: JSON.stringify({ user_id: userId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const bookmarkResponse = await fetch(`${baseUrl}/forum/threads/${threadId}/bookmarks`, {
        body: JSON.stringify({ user_id: userId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      assert.equal(replyResponse.status, 201);
      assert.equal(voteResponse.status, 204);
      assert.equal(bookmarkResponse.status, 204);
      assert.match(calls[0].sql, /INSERT INTO forum_posts/);
      assert.match(calls[1].sql, /INSERT INTO forum_thread_votes/);
      assert.match(calls[2].sql, /INSERT INTO forum_bookmarks/);
    });
  });

  it('records moderation events and updates thread status', async () => {
    const event = { action: 'lock', id: 'event-1' };
    const thread = { id: threadId, pinned_at: null, status: 'locked' };
    const { calls, pool } = createMockPool([{ rows: [event] }, { rows: [thread] }]);

    await withForumServer(pool, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/forum/threads/${threadId}/moderation`, {
        body: JSON.stringify({ action: 'lock', reason: 'Spam cleanup' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const payload = await response.json();

      assert.equal(response.status, 201);
      assert.deepEqual(payload, { event, thread });
      assert.match(calls[0].sql, /INSERT INTO forum_moderation_events/);
      assert.equal(calls[1].params?.[1], 'locked');
    });
  });
});
