BEGIN;

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id),
  CONSTRAINT oauth_accounts_provider_not_blank CHECK (btrim(provider) <> ''),
  CONSTRAINT oauth_accounts_provider_user_not_blank CHECK (btrim(provider_user_id) <> '')
);

DROP TRIGGER IF EXISTS oauth_accounts_set_updated_at ON oauth_accounts;
CREATE TRIGGER oauth_accounts_set_updated_at
BEFORE UPDATE ON oauth_accounts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS user_sessions_user_expires_idx
  ON user_sessions(user_id, expires_at DESC);

COMMIT;
