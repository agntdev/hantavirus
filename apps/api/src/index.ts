import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { checkDatabase, pool } from './db.js';
import { createFeedbackRouter } from './feedback.js';
import {
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

app.use('/api/feedback', createFeedbackRouter(pool));

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
