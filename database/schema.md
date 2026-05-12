# Database schema

The initial PostgreSQL schema is defined in
`database/migrations/001_initial_schema.sql`. It creates the core relational
model for users, medical education content, forum discussions, and outbreak
tracking.

## Users

`users` stores account identity and role information. `user_profiles` extends a
user with optional organization, country, biography, credentials, and avatar
metadata. Roles are intentionally broad enough for future authentication and
authorization work: member, contributor, medical expert, moderator, and admin.

## Medical content

`medical_content` stores articles, FAQs, guidelines, infographics, and videos.
Each content item can have an author, a publication status, source links, and
metadata for future integrations. `content_categories` and
`medical_content_categories` provide many-to-many categorization.

`content_reviews` records expert or moderator review decisions separately from
the content record, preserving review history while allowing the content status
to represent the latest workflow state.

## Forum

`forum_threads` stores top-level discussions and `forum_posts` stores replies.
Posts can point to a parent post for nested answers, and both tables keep update
timestamps for moderation and activity sorting.

## Outbreak tracking

`outbreak_reports` stores reported outbreak events with verification state,
severity, location, optional coordinates, case counts, exposure notes, and
structured metadata. `outbreak_report_sources` attaches external references,
and `outbreak_report_content_links` connects reports to relevant educational
content.

## Expansion points

- Enum-backed workflow fields keep allowed states explicit.
- JSONB metadata columns support future integrations without blocking the first
  migration on every detail.
- Full-text and workflow indexes support search, moderation queues, and outbreak
  dashboards.
- Foreign keys use cascading or nulling behavior based on ownership: dependent
  rows are removed for join/source records, while public content and reports can
  survive user deletion.
