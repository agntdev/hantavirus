import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const FEEDBACK_CATEGORIES = [
  'bug',
  'content_request',
  'content_correction',
  'usability',
  'general'
] as const;

export const feedbackInputSchema = z.object({
  body: z.string().trim().min(1, 'body is required').max(5000),
  category: z.enum(FEEDBACK_CATEGORIES),
  contact_email: z.string().trim().email().max(254).optional(),
  page_url: z.string().trim().url().max(2048).optional(),
  subject: z.string().trim().min(1, 'subject is required').max(200),
  submitted_by_id: z.string().uuid().optional()
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

type FeedbackSummary = {
  by_category: Array<{ category: string; count: number }>;
  by_status: Array<{ count: number; status: string }>;
  recent: Array<{
    category: string;
    created_at: string;
    id: string;
    status: string;
    subject: string;
  }>;
  total: number;
};

type SummaryCache = {
  expiresAt: number;
  summary: FeedbackSummary;
};

const SUMMARY_CACHE_TTL_MS = 30_000;

export function parseFeedbackInput(value: unknown): FeedbackInput {
  return feedbackInputSchema.parse(value);
}

export function createFeedbackRouter(pool: pg.Pool): Router {
  const router = Router();
  let summaryCache: SummaryCache | null = null;

  router.post('/', async (request, response) => {
    const parsed = feedbackInputSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: 'invalid_feedback',
        issues: parsed.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path
        }))
      });
      return;
    }

    const input = parsed.data;
    const { rows } = await pool.query<{
      created_at: string;
      id: string;
      status: string;
    }>(
      `INSERT INTO user_feedback
         (submitted_by_id, contact_email, category, subject, body, page_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, created_at`,
      [
        input.submitted_by_id ?? null,
        input.contact_email ?? null,
        input.category,
        input.subject,
        input.body,
        input.page_url ?? null
      ]
    );

    summaryCache = null;
    response.status(201).json(rows[0]);
  });

  router.get('/summary', async (_request, response) => {
    const now = Date.now();
    if (summaryCache && summaryCache.expiresAt > now) {
      response.setHeader('X-Cache', 'HIT');
      response.json(summaryCache.summary);
      return;
    }

    const [byCategory, byStatus, total, recent] = await Promise.all([
      pool.query<{ category: string; count: string }>(
        `SELECT category, count(*)::text AS count
           FROM user_feedback
          GROUP BY category
          ORDER BY count(*) DESC, category ASC`
      ),
      pool.query<{ count: string; status: string }>(
        `SELECT status, count(*)::text AS count
           FROM user_feedback
          GROUP BY status
          ORDER BY count(*) DESC, status ASC`
      ),
      pool.query<{ total: string }>(
        `SELECT count(*)::text AS total FROM user_feedback`
      ),
      pool.query<{
        category: string;
        created_at: string;
        id: string;
        status: string;
        subject: string;
      }>(
        `SELECT id, category, status, subject, created_at
           FROM user_feedback
          ORDER BY created_at DESC
          LIMIT 5`
      )
    ]);

    const summary: FeedbackSummary = {
      by_category: byCategory.rows.map((row) => ({
        category: row.category,
        count: Number(row.count)
      })),
      by_status: byStatus.rows.map((row) => ({
        count: Number(row.count),
        status: row.status
      })),
      recent: recent.rows,
      total: Number(total.rows[0]?.total ?? 0)
    };

    summaryCache = {
      expiresAt: now + SUMMARY_CACHE_TTL_MS,
      summary
    };

    response.setHeader('Cache-Control', 'private, max-age=30');
    response.setHeader('X-Cache', 'MISS');
    response.json(summary);
  });

  return router;
}
