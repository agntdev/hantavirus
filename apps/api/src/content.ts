import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const CONTENT_TYPES = ['article', 'faq', 'guideline', 'infographic', 'video'] as const;
const CONTENT_STATUSES = ['draft', 'in_review', 'published', 'archived', 'rejected'] as const;
const REVIEW_DECISIONS = ['approved', 'changes_requested', 'rejected'] as const;

const slugSchema = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);

export const contentCategorySchema = z.object({
  description: z.string().trim().max(500).optional(),
  name: z.string().trim().min(2).max(120),
  slug: slugSchema
});

export const contentSubmissionSchema = z.object({
  body_markdown: z.string().trim().min(40).max(20000),
  contact_email: z.string().trim().email().max(254),
  content_type: z.enum(CONTENT_TYPES),
  credentials: z.string().trim().min(3).max(500),
  expert_name: z.string().trim().min(2).max(160),
  source_url: z.string().trim().url().max(2048),
  summary: z.string().trim().min(10).max(500),
  title: z.string().trim().min(3).max(200)
});

export const contentReviewSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  notes: z.string().trim().min(3).max(2000),
  reviewer_credentials: z.string().trim().min(3).max(500),
  reviewer_name: z.string().trim().min(2).max(160)
});

export const contentUpdateSchema = z.object({
  status: z.enum(CONTENT_STATUSES).optional(),
  summary: z.string().trim().min(10).max(500).optional(),
  tags: z.array(slugSchema).max(12).optional(),
  title: z.string().trim().min(3).max(200).optional()
});

export type ContentCategoryInput = z.infer<typeof contentCategorySchema>;
export type ContentSubmission = z.infer<typeof contentSubmissionSchema>;
export type ContentReviewInput = z.infer<typeof contentReviewSchema>;
export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug || 'content'}-${randomUUID().slice(0, 8)}`;
}

export function parseContentSubmission(value: unknown): ContentSubmission {
  return contentSubmissionSchema.parse(value);
}

export function parseContentReview(value: unknown): ContentReviewInput {
  return contentReviewSchema.parse(value);
}

export function parseContentUpdate(value: unknown): ContentUpdateInput {
  return contentUpdateSchema.parse(value);
}

function nextContentStatus(decision: ContentReviewInput['decision']) {
  return decision === 'approved'
    ? 'published'
    : decision === 'rejected'
      ? 'rejected'
      : 'in_review';
}

export function createContentRouter(pool: pg.Pool): Router {
  const router = Router();

  router.get('/review-queue', async (_request, response) => {
    const { rows } = await pool.query(
      `SELECT id, content_type, status, title, slug, summary, source_url, metadata, updated_at
         FROM medical_content
        WHERE status = 'in_review'
        ORDER BY updated_at ASC
        LIMIT 50`
    );

    response.json({ items: rows });
  });

  router.get('/categories', async (_request, response) => {
    const { rows } = await pool.query(
      `SELECT id, name, slug, description, updated_at
         FROM content_categories
        ORDER BY name ASC`
    );
    response.json({ categories: rows });
  });

  router.post('/categories', async (request, response) => {
    const parsed = contentCategorySchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'invalid_content_category' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO content_categories (name, slug, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              description = EXCLUDED.description
       RETURNING id, name, slug, description`,
      [parsed.data.name, parsed.data.slug, parsed.data.description ?? null]
    );
    response.status(201).json(rows[0]);
  });

  router.get('/search', async (request, response) => {
    const query = z.string().trim().max(120).optional().parse(request.query.q);
    const type = z.enum(CONTENT_TYPES).optional().parse(request.query.content_type);
    const { rows } = await pool.query(
      `SELECT id, content_type, status, title, slug, summary, source_url, metadata, updated_at
         FROM medical_content
        WHERE ($1::text IS NULL OR title ILIKE '%' || $1 || '%' OR summary ILIKE '%' || $1 || '%')
          AND ($2::text IS NULL OR content_type::text = $2)
        ORDER BY updated_at DESC
        LIMIT 50`,
      [query || null, type || null]
    );
    response.json({ items: rows });
  });

  router.get('/', async (request, response) => {
    const status = z.enum(CONTENT_STATUSES).optional().parse(request.query.status);
    const params = status ? [status] : [];
    const where = status ? 'WHERE status = $1' : '';
    const { rows } = await pool.query(
      `SELECT id, content_type, status, title, slug, summary, source_url, metadata, updated_at
         FROM medical_content
        ${where}
        ORDER BY updated_at DESC
        LIMIT 50`,
      params
    );

    response.json({ items: rows });
  });

  router.post('/submissions', async (request, response) => {
    const parsed = contentSubmissionSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: 'invalid_content_submission',
        issues: parsed.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path
        }))
      });
      return;
    }

    const input = parsed.data;
    const metadata = {
      contact_email: input.contact_email,
      credentials: input.credentials,
      expert_name: input.expert_name,
      medical_review_required: true,
      submission_source: 'expert_submission'
    };
    const { rows } = await pool.query(
      `INSERT INTO medical_content
         (content_type, status, title, slug, summary, body_markdown, source_url, metadata)
       VALUES ($1, 'in_review', $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, status, slug, created_at`,
      [
        input.content_type,
        input.title,
        slugify(input.title),
        input.summary,
        input.body_markdown,
        input.source_url,
        JSON.stringify(metadata)
      ]
    );

    response.status(201).json(rows[0]);
  });

  router.patch('/:id', async (request, response) => {
    const contentId = z.string().uuid().safeParse(request.params.id);
    const parsed = contentUpdateSchema.safeParse(request.body);
    if (!contentId.success || !parsed.success) {
      response.status(400).json({ error: 'invalid_content_update' });
      return;
    }

    const metadata = parsed.data.tags ? { tags: parsed.data.tags } : {};
    const { rows } = await pool.query(
      `UPDATE medical_content
          SET status = COALESCE($2, status),
              title = COALESCE($3, title),
              summary = COALESCE($4, summary),
              metadata = metadata || $5::jsonb
        WHERE id = $1
        RETURNING id, status, title, summary, metadata, updated_at`,
      [
        contentId.data,
        parsed.data.status ?? null,
        parsed.data.title ?? null,
        parsed.data.summary ?? null,
        JSON.stringify(metadata)
      ]
    );
    response.json(rows[0]);
  });

  router.post('/:id/reviews', async (request, response) => {
    const contentId = z.string().uuid().safeParse(request.params.id);
    const parsed = contentReviewSchema.safeParse(request.body);
    if (!contentId.success || !parsed.success) {
      response.status(400).json({ error: 'invalid_content_review' });
      return;
    }

    const input = parsed.data;
    const notes = [
      `Reviewer: ${input.reviewer_name}`,
      `Credentials: ${input.reviewer_credentials}`,
      input.notes
    ].join('\n\n');
    const [reviewResult, updateResult] = await Promise.all([
      pool.query(
        `INSERT INTO content_reviews (content_id, decision, notes)
         VALUES ($1, $2, $3)
         RETURNING id, decision, reviewed_at`,
        [contentId.data, input.decision, notes]
      ),
      pool.query(
        `UPDATE medical_content
            SET status = $2,
                published_at = CASE WHEN $2 = 'published' THEN now() ELSE published_at END
          WHERE id = $1
          RETURNING id, status, published_at`,
        [contentId.data, nextContentStatus(input.decision)]
      )
    ]);

    response.status(201).json({
      content: updateResult.rows[0],
      review: reviewResult.rows[0]
    });
  });

  return router;
}
