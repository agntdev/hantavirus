BEGIN;

CREATE INDEX IF NOT EXISTS user_feedback_summary_category_created_idx
  ON user_feedback(category, created_at DESC);

CREATE INDEX IF NOT EXISTS user_feedback_summary_status_created_idx
  ON user_feedback(status, created_at DESC);

CREATE INDEX IF NOT EXISTS user_feedback_recent_summary_idx
  ON user_feedback(created_at DESC, id);

COMMIT;
