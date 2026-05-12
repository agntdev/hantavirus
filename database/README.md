# Database

The application targets PostgreSQL in deployed environments. Local development
can use any PostgreSQL-compatible instance exposed through `DATABASE_URL`.

Planned layout:

- `migrations/` contains ordered SQL migration files. Start with
  `001_initial_schema.sql`.
- `seeds/` contains development-only seed data.

See `schema.md` for the current domain model and relationship overview.
