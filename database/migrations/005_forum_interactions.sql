BEGIN;

CREATE TABLE IF NOT EXISTS forum_thread_votes (
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_bookmarks (
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  moderator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_moderation_action_known CHECK (
    action IN ('archive', 'lock', 'pin', 'reopen', 'unpin')
  ),
  CONSTRAINT forum_moderation_reason_not_blank CHECK (btrim(reason) <> '')
);

CREATE INDEX IF NOT EXISTS forum_posts_thread_created_idx
  ON forum_posts(thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS forum_moderation_events_thread_idx
  ON forum_moderation_events(thread_id, created_at DESC);

COMMIT;
