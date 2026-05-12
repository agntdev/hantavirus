import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const THREAD_STATUSES = ['archived', 'locked', 'open'] as const;
const MODERATION_ACTIONS = ['archive', 'lock', 'pin', 'reopen', 'unpin'] as const;

const basePostSchema = z.object({
  author_id: z.string().uuid().optional(),
  body_markdown: z.string().trim().min(3).max(10000),
  parent_post_id: z.string().uuid().optional()
});

export const threadInputSchema = basePostSchema.extend({
  title: z.string().trim().min(3).max(200)
});

export const replyInputSchema = basePostSchema;

export const moderationInputSchema = z.object({
  action: z.enum(MODERATION_ACTIONS),
  moderator_id: z.string().uuid().optional(),
  reason: z.string().trim().min(3).max(1000)
});

export type ThreadInput = z.infer<typeof threadInputSchema>;
export type ReplyInput = z.infer<typeof replyInputSchema>;
export type ModerationInput = z.infer<typeof moderationInputSchema>;

function hasSpamSignals(value: string) {
  const links = value.match(/https?:\/\//g)?.length ?? 0;
  return links > 3 || /(.)\1{12,}/.test(value);
}

function safeParsePost<T extends { body_markdown: string }>(
  schema: z.ZodType<T>,
  value: unknown
) {
  const parsed = schema.safeParse(value);
  if (!parsed.success || hasSpamSignals(parsed.data.body_markdown)) {
    return null;
  }
  return parsed.data;
}

export function parseThreadInput(value: unknown): ThreadInput {
  const parsed = safeParsePost(threadInputSchema, value);
  if (!parsed) throw new Error('Invalid forum thread');
  return parsed;
}

export function parseReplyInput(value: unknown): ReplyInput {
  const parsed = safeParsePost(replyInputSchema, value);
  if (!parsed) throw new Error('Invalid forum reply');
  return parsed;
}

export function createForumRouter(pool: pg.Pool): Router {
  const router = Router();

  router.get('/threads', async (request, response) => {
    const status = z.enum(THREAD_STATUSES).optional().parse(request.query.status);
    const params = status ? [status] : [];
    const where = status ? 'WHERE t.status = $1' : '';
    const { rows } = await pool.query(
      `SELECT t.id, t.status, t.title, t.body_markdown, t.pinned_at, t.created_at,
              count(p.id)::int AS reply_count
         FROM forum_threads t
         LEFT JOIN forum_posts p ON p.thread_id = t.id
        ${where}
        GROUP BY t.id
        ORDER BY t.pinned_at DESC NULLS LAST, t.updated_at DESC
        LIMIT 50`,
      params
    );
    response.json({ threads: rows });
  });

  router.post('/threads', async (request, response) => {
    const input = safeParsePost(threadInputSchema, request.body);
    if (!input) {
      response.status(400).json({ error: 'invalid_forum_thread' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO forum_threads (author_id, title, body_markdown)
       VALUES ($1, $2, $3)
       RETURNING id, status, title, created_at`,
      [input.author_id ?? null, input.title, input.body_markdown]
    );
    response.status(201).json(rows[0]);
  });

  router.post('/threads/:threadId/posts', async (request, response) => {
    const threadId = z.string().uuid().safeParse(request.params.threadId);
    const input = safeParsePost(replyInputSchema, request.body);
    if (!threadId.success || !input) {
      response.status(400).json({ error: 'invalid_forum_reply' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO forum_posts (thread_id, author_id, parent_post_id, body_markdown)
       VALUES ($1, $2, $3, $4)
       RETURNING id, thread_id, parent_post_id, created_at`,
      [threadId.data, input.author_id ?? null, input.parent_post_id ?? null, input.body_markdown]
    );
    response.status(201).json(rows[0]);
  });

  router.post('/threads/:threadId/votes', async (request, response) => {
    const threadId = z.string().uuid().safeParse(request.params.threadId);
    const userId = z.string().uuid().safeParse(request.body?.user_id);
    if (!threadId.success || !userId.success) {
      response.status(400).json({ error: 'invalid_forum_vote' });
      return;
    }

    await pool.query(
      `INSERT INTO forum_thread_votes (thread_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (thread_id, user_id) DO NOTHING`,
      [threadId.data, userId.data]
    );
    response.status(204).end();
  });

  router.post('/threads/:threadId/bookmarks', async (request, response) => {
    const threadId = z.string().uuid().safeParse(request.params.threadId);
    const userId = z.string().uuid().safeParse(request.body?.user_id);
    if (!threadId.success || !userId.success) {
      response.status(400).json({ error: 'invalid_forum_bookmark' });
      return;
    }

    await pool.query(
      `INSERT INTO forum_bookmarks (thread_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (thread_id, user_id) DO NOTHING`,
      [threadId.data, userId.data]
    );
    response.status(204).end();
  });

  router.post('/threads/:threadId/moderation', async (request, response) => {
    const threadId = z.string().uuid().safeParse(request.params.threadId);
    const parsed = moderationInputSchema.safeParse(request.body);
    if (!threadId.success || !parsed.success) {
      response.status(400).json({ error: 'invalid_forum_moderation' });
      return;
    }

    const status = parsed.data.action === 'lock'
      ? 'locked'
      : parsed.data.action === 'archive'
        ? 'archived'
        : parsed.data.action === 'reopen'
          ? 'open'
          : null;
    const [eventResult, threadResult] = await Promise.all([
      pool.query(
        `INSERT INTO forum_moderation_events (thread_id, moderator_id, action, reason)
         VALUES ($1, $2, $3, $4)
         RETURNING id, action, created_at`,
        [
          threadId.data,
          parsed.data.moderator_id ?? null,
          parsed.data.action,
          parsed.data.reason
        ]
      ),
      pool.query(
        `UPDATE forum_threads
            SET status = COALESCE($2, status),
                pinned_at = CASE
                  WHEN $3 = 'pin' THEN now()
                  WHEN $3 = 'unpin' THEN NULL
                  ELSE pinned_at
                END
          WHERE id = $1
          RETURNING id, status, pinned_at`,
        [threadId.data, status, parsed.data.action]
      )
    ]);

    response.status(201).json({
      event: eventResult.rows[0],
      thread: threadResult.rows[0]
    });
  });

  return router;
}
