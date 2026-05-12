BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM (
    'member',
    'contributor',
    'medical_expert',
    'moderator',
    'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE content_type AS ENUM (
    'article',
    'faq',
    'guideline',
    'infographic',
    'video'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE content_status AS ENUM (
    'draft',
    'in_review',
    'published',
    'archived',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE review_decision AS ENUM (
    'approved',
    'changes_requested',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE thread_status AS ENUM (
    'open',
    'locked',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE outbreak_status AS ENUM (
    'reported',
    'under_review',
    'verified',
    'resolved',
    'dismissed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE outbreak_severity AS ENUM (
    'low',
    'moderate',
    'high',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  display_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  password_hash text,
  email_verified_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_display_name_not_blank CHECK (btrim(display_name) <> '')
);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization text,
  title text,
  country_code char(2),
  biography text,
  credentials text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_country_code_upper CHECK (
    country_code IS NULL OR country_code = upper(country_code)
  )
);

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_categories_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT content_categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

DROP TRIGGER IF EXISTS content_categories_set_updated_at ON content_categories;
CREATE TRIGGER content_categories_set_updated_at
BEFORE UPDATE ON content_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS medical_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  content_type content_type NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  body_markdown text NOT NULL,
  source_url text,
  hero_image_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT medical_content_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT medical_content_summary_not_blank CHECK (btrim(summary) <> ''),
  CONSTRAINT medical_content_body_not_blank CHECK (btrim(body_markdown) <> ''),
  CONSTRAINT medical_content_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT medical_content_published_has_date CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

DROP TRIGGER IF EXISTS medical_content_set_updated_at ON medical_content;
CREATE TRIGGER medical_content_set_updated_at
BEFORE UPDATE ON medical_content
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS medical_content_categories (
  content_id uuid NOT NULL REFERENCES medical_content(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES content_categories(id) ON DELETE RESTRICT,
  PRIMARY KEY (content_id, category_id)
);

CREATE TABLE IF NOT EXISTS content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES medical_content(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  decision review_decision NOT NULL,
  notes text,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status thread_status NOT NULL DEFAULT 'open',
  title text NOT NULL,
  body_markdown text NOT NULL,
  pinned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_threads_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT forum_threads_body_not_blank CHECK (btrim(body_markdown) <> '')
);

DROP TRIGGER IF EXISTS forum_threads_set_updated_at ON forum_threads;
CREATE TRIGGER forum_threads_set_updated_at
BEFORE UPDATE ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  parent_post_id uuid REFERENCES forum_posts(id) ON DELETE SET NULL,
  body_markdown text NOT NULL,
  accepted_answer_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_posts_body_not_blank CHECK (btrim(body_markdown) <> ''),
  CONSTRAINT forum_posts_not_self_parent CHECK (parent_post_id IS NULL OR parent_post_id <> id)
);

DROP TRIGGER IF EXISTS forum_posts_set_updated_at ON forum_posts;
CREATE TRIGGER forum_posts_set_updated_at
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS outbreak_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status outbreak_status NOT NULL DEFAULT 'reported',
  severity outbreak_severity NOT NULL DEFAULT 'low',
  title text NOT NULL,
  description text NOT NULL,
  country_code char(2) NOT NULL,
  region text,
  locality text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  case_count integer NOT NULL DEFAULT 0,
  suspected_exposure_source text,
  occurred_on date,
  verified_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbreak_reports_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT outbreak_reports_description_not_blank CHECK (btrim(description) <> ''),
  CONSTRAINT outbreak_reports_country_code_upper CHECK (country_code = upper(country_code)),
  CONSTRAINT outbreak_reports_latitude_range CHECK (
    latitude IS NULL OR latitude BETWEEN -90 AND 90
  ),
  CONSTRAINT outbreak_reports_longitude_range CHECK (
    longitude IS NULL OR longitude BETWEEN -180 AND 180
  ),
  CONSTRAINT outbreak_reports_case_count_nonnegative CHECK (case_count >= 0),
  CONSTRAINT outbreak_reports_verified_has_reviewer CHECK (
    status <> 'verified' OR verified_by_id IS NOT NULL
  )
);

DROP TRIGGER IF EXISTS outbreak_reports_set_updated_at ON outbreak_reports;
CREATE TRIGGER outbreak_reports_set_updated_at
BEFORE UPDATE ON outbreak_reports
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS outbreak_report_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbreak_report_id uuid NOT NULL REFERENCES outbreak_reports(id) ON DELETE CASCADE,
  label text NOT NULL,
  source_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbreak_report_sources_label_not_blank CHECK (btrim(label) <> ''),
  CONSTRAINT outbreak_report_sources_url_not_blank CHECK (btrim(source_url) <> '')
);

CREATE TABLE IF NOT EXISTS outbreak_report_content_links (
  outbreak_report_id uuid NOT NULL REFERENCES outbreak_reports(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES medical_content(id) ON DELETE CASCADE,
  PRIMARY KEY (outbreak_report_id, content_id)
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS medical_content_status_idx ON medical_content(status);
CREATE INDEX IF NOT EXISTS medical_content_type_idx ON medical_content(content_type);
CREATE INDEX IF NOT EXISTS medical_content_author_idx ON medical_content(author_id);
CREATE INDEX IF NOT EXISTS medical_content_search_idx ON medical_content
USING gin (
  to_tsvector(
    'english',
    title || ' ' || summary || ' ' || body_markdown
  )
);
CREATE INDEX IF NOT EXISTS content_reviews_content_idx ON content_reviews(content_id);
CREATE INDEX IF NOT EXISTS forum_threads_status_idx ON forum_threads(status);
CREATE INDEX IF NOT EXISTS forum_threads_author_idx ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS forum_posts_thread_idx ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS forum_posts_author_idx ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS outbreak_reports_status_idx ON outbreak_reports(status);
CREATE INDEX IF NOT EXISTS outbreak_reports_severity_idx ON outbreak_reports(severity);
CREATE INDEX IF NOT EXISTS outbreak_reports_country_region_idx ON outbreak_reports(country_code, region);
CREATE INDEX IF NOT EXISTS outbreak_reports_occurred_on_idx ON outbreak_reports(occurred_on);
CREATE INDEX IF NOT EXISTS outbreak_reports_location_idx ON outbreak_reports(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMIT;
