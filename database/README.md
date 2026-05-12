# Database

The application targets PostgreSQL in deployed environments. Local development
can use any PostgreSQL-compatible instance exposed through `DATABASE_URL`.

Planned layout:

- `migrations/` contains ordered SQL migration files.
- `seeds/` contains development-only seed data.

Task T02 will add the first domain schema for users, medical content, forum
posts, and outbreak tracking.
