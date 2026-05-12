# hantavirus

Comprehensive online resource for hantavirus information and prevention.

## Project structure

- `apps/web` - React and Vite frontend.
- `apps/api` - Express API service backed by PostgreSQL.
- `database/migrations` - ordered PostgreSQL migrations.
- `database/seeds` - development-only seed data.
- `tasks` - bounty task descriptions.

## Local setup

1. Copy `.env.example` to `.env` and update `DATABASE_URL` if needed.
2. Install dependencies with `npm install`.
3. Start the API with `npm run dev:api`.
4. Start the web app with `npm run dev:web`.

## Scripts

- `npm run build` builds all workspaces.
- `npm run typecheck` runs TypeScript checks for all workspaces.
- `npm run lint` currently runs the same strict TypeScript checks.
- `npm run test` runs workspace tests when they exist.
