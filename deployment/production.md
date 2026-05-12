# Production deployment

This repository can run as three production services: the Express API, the
static Vite web app, and PostgreSQL.

## Required environment

- `NODE_ENV=production`
- `API_PORT=4000`
- `CORS_ORIGIN=https://your-public-web-origin.example`
- `DATABASE_URL=postgres://user:password@host:5432/hantavirus`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` when using the
  bundled Docker Compose PostgreSQL service

## Docker Compose path

1. Copy `.env.example` to `.env` and replace development defaults.
2. Run `npm run deploy:check`.
3. Run `docker compose -f docker-compose.production.yml up --build -d`.
4. Check `http://localhost:8080/` for the web app.
5. Check `http://localhost:8080/api/health` and `/api/ready` for API health.

## Monitoring and logging

- The API adds `X-Request-Id` to every response and preserves incoming request
  ids from proxies.
- Access logs are JSON records with method, path, status, duration, and request
  id.
- Error logs are JSON records keyed by request id and the API returns a stable
  `internal_error` payload without leaking exception details.
- Docker health checks call `/health`, `/ready`, and the web root so process
  managers can restart unhealthy services.

## Security posture

- Helmet security headers are enabled for the API.
- Express `x-powered-by` is disabled.
- CORS is limited to `CORS_ORIGIN` with only `GET`, `POST`, and `OPTIONS`.
- JSON request bodies are capped at `64kb`.
- Nginx serves the web app with `nosniff`, `DENY` frame policy, and strict
  referrer policy headers.
