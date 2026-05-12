import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';

const OUTBREAK_STATUSES = ['dismissed', 'reported', 'resolved', 'under_review', 'verified'] as const;
const OUTBREAK_SEVERITIES = ['critical', 'high', 'low', 'moderate'] as const;

export const outbreakReportSchema = z.object({
  case_count: z.number().int().min(0).default(0),
  country_code: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  description: z.string().trim().min(10).max(5000),
  latitude: z.number().min(-90).max(90).optional(),
  locality: z.string().trim().max(160).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  region: z.string().trim().max(160).optional(),
  reported_by_id: z.string().uuid().optional(),
  severity: z.enum(OUTBREAK_SEVERITIES).default('low'),
  suspected_exposure_source: z.string().trim().max(500).optional(),
  title: z.string().trim().min(3).max(200)
});

export const outbreakSourceSchema = z.object({
  label: z.string().trim().min(2).max(160),
  source_url: z.string().trim().url().max(2048)
});

export type OutbreakReportInput = z.infer<typeof outbreakReportSchema>;

export function parseOutbreakReport(value: unknown): OutbreakReportInput {
  return outbreakReportSchema.parse(value);
}

export function createOutbreakRouter(pool: pg.Pool): Router {
  const router = Router();

  router.get('/reports', async (request, response) => {
    const status = z.enum(OUTBREAK_STATUSES).optional().parse(request.query.status);
    const severity = z.enum(OUTBREAK_SEVERITIES).optional().parse(request.query.severity);
    const country = z.string().trim().length(2).optional().parse(request.query.country_code);
    const { rows } = await pool.query(
      `SELECT id, status, severity, title, country_code, region, locality,
              latitude, longitude, case_count, occurred_on, updated_at
         FROM outbreak_reports
        WHERE ($1::text IS NULL OR status::text = $1)
          AND ($2::text IS NULL OR severity::text = $2)
          AND ($3::text IS NULL OR country_code = upper($3))
        ORDER BY occurred_on DESC NULLS LAST, updated_at DESC
        LIMIT 100`,
      [status || null, severity || null, country || null]
    );

    response.json({ reports: rows });
  });

  router.post('/reports', async (request, response) => {
    const parsed = outbreakReportSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'invalid_outbreak_report' });
      return;
    }

    const input = parsed.data;
    const { rows } = await pool.query(
      `INSERT INTO outbreak_reports
         (reported_by_id, severity, title, description, country_code, region, locality,
          latitude, longitude, case_count, suspected_exposure_source, occurred_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, status, severity, title, country_code, region, locality, latitude, longitude, case_count`,
      [
        input.reported_by_id ?? null,
        input.severity,
        input.title,
        input.description,
        input.country_code,
        input.region ?? null,
        input.locality ?? null,
        input.latitude ?? null,
        input.longitude ?? null,
        input.case_count,
        input.suspected_exposure_source ?? null,
        input.occurred_on ?? null
      ]
    );

    response.status(201).json(rows[0]);
  });

  router.post('/reports/:id/sources', async (request, response) => {
    const reportId = z.string().uuid().safeParse(request.params.id);
    const parsed = outbreakSourceSchema.safeParse(request.body);
    if (!reportId.success || !parsed.success) {
      response.status(400).json({ error: 'invalid_outbreak_source' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO outbreak_report_sources (outbreak_report_id, label, source_url)
       VALUES ($1, $2, $3)
       RETURNING id, label, source_url, created_at`,
      [reportId.data, parsed.data.label, parsed.data.source_url]
    );
    response.status(201).json(rows[0]);
  });

  return router;
}
