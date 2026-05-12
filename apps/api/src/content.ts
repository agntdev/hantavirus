import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const CONTENT_TYPES = ['article', 'faq', 'guideline', 'infographic', 'video'] as const;
const CONTENT_STATUSES = ['draft', 'in_review', 'published', 'archived', 'rejected'] as const;

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

export type ContentSubmission = z.infer<typeof contentSubmissionSchema>;

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

export function createContentRouter(pool: pg.Pool): Router {
  const router = Router();

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

  return router;
}
