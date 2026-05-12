import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { createContentRouter } from './content.js';
import { checkDatabase, pool } from './db.js';
import { createFeedbackRouter } from './feedback.js';
import { createForumRouter } from './forum.js';
import { createOutbreakRouter } from './outbreaks.js';
import {
  buildLaunchStatus,
  createAccessLogMiddleware,
  createErrorHandler,
  createNotFoundHandler,
  createRequestIdMiddleware
} from './monitoring.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(createRequestIdMiddleware());
app.use(createAccessLogMiddleware());
app.use(helmet());
app.use(
  cors({
    maxAge: 600,
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: config.CORS_ORIGIN
  })
);
app.use(express.json({ limit: '64kb' }));

app.use('/api/content', createContentRouter(pool));
app.use('/api/feedback', createFeedbackRouter(pool));
app.use('/api/forum', createForumRouter(pool));
app.use('/api/outbreaks', createOutbreakRouter(pool));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'hantavirus-api' });
});

app.get('/ready', async (_request, response) => {
  try {
    const database = await checkDatabase();
    response.json({ status: database ? 'ready' : 'degraded', database });
  } catch (error) {
    response.status(503).json({
      status: 'degraded',
      database: false,
      message: error instanceof Error ? error.message : 'Database check failed'
    });
  }
});

app.get('/api/launch/status', async (_request, response) => {
  const checkedAt = new Date().toISOString();
  let databaseReady = false;
  let openFeedbackItems = 0;

  try {
    databaseReady = await checkDatabase();
    if (databaseReady) {
      const { rows } = await pool.query<{ total: string }>(
        `SELECT count(*)::text AS total
           FROM user_feedback
          WHERE status <> 'resolved'`
      );
      openFeedbackItems = Number(rows[0]?.total ?? 0);
    }
  } catch {
    databaseReady = false;
  }

  const launchStatus = buildLaunchStatus({
    averageLatencyMs: 0,
    checkedAt,
    criticalErrorsLastHour: 0,
    databaseReady,
    openFeedbackItems,
    version: process.env.npm_package_version ?? '0.1.0'
  });

  response.status(launchStatus.status === 'blocked' ? 503 : 200).json(launchStatus);
});

app.use(createNotFoundHandler());
app.use(createErrorHandler());

const server = app.listen(config.API_PORT, () => {
  console.log(`Hantavirus API listening on port ${config.API_PORT}`);
});

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
