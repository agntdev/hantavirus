BEGIN;

DO $$
BEGIN
  CREATE TYPE feedback_category AS ENUM (
    'bug',
    'content_request',
    'content_correction',
    'usability',
    'general'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE feedback_status AS ENUM (
    'new',
    'triaged',
    'in_progress',
    'resolved',
    'wontfix'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  contact_email citext,
  category feedback_category NOT NULL,
  status feedback_status NOT NULL DEFAULT 'new',
  subject text NOT NULL,
  body text NOT NULL,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_feedback_subject_not_blank CHECK (btrim(subject) <> ''),
  CONSTRAINT user_feedback_body_not_blank CHECK (btrim(body) <> '')
);

DROP TRIGGER IF EXISTS user_feedback_set_updated_at ON user_feedback;
CREATE TRIGGER user_feedback_set_updated_at
BEFORE UPDATE ON user_feedback
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS user_feedback_category_idx ON user_feedback(category);
CREATE INDEX IF NOT EXISTS user_feedback_status_idx ON user_feedback(status);
CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS user_feedback_submitted_by_idx ON user_feedback(submitted_by_id);

COMMIT;
