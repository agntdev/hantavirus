BEGIN;

INSERT INTO content_categories (name, slug, description)
VALUES
  ('Prevention', 'prevention', 'Source-backed prevention education drafts.'),
  ('Awareness', 'awareness', 'Reader-facing outbreak awareness assets.'),
  ('Response', 'response', 'Reviewed response-pathway education assets.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO medical_content
  (content_type, status, title, slug, summary, body_markdown, source_url, metadata)
VALUES
  (
    'article',
    'in_review',
    'Prevention checklist article',
    'prevention-checklist-article',
    'Draft article for source-backed prevention guidance before expert publication.',
    'This draft content item reserves the prevention checklist article in the library. It must be reviewed against the linked CDC prevention source and approved by a qualified reviewer before publication.',
    'https://www.cdc.gov/hantavirus/prevention/index.html',
    '{"medical_review_required": true, "format": "article", "seeded": true}'::jsonb
  ),
  (
    'video',
    'in_review',
    'Outbreak awareness video',
    'outbreak-awareness-video',
    'Draft video outline for where readers can find outbreak awareness updates.',
    'This draft content item reserves the outbreak awareness video outline. It must be reviewed against the linked CDC hantavirus source and approved by a qualified reviewer before publication.',
    'https://www.cdc.gov/hantavirus/',
    '{"medical_review_required": true, "format": "video", "seeded": true}'::jsonb
  ),
  (
    'infographic',
    'in_review',
    'Response pathway infographic',
    'response-pathway-infographic',
    'Draft infographic template for source-backed response pathway education.',
    'This draft content item reserves the response pathway infographic. It must be reviewed against the linked CDC clinical overview source and approved by a qualified reviewer before publication.',
    'https://www.cdc.gov/hantavirus/hcp/clinical-overview/index.html',
    '{"medical_review_required": true, "format": "infographic", "seeded": true}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
