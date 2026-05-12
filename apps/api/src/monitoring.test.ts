import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import {
  buildLaunchStatus,
  createAccessLogMiddleware,
  createErrorHandler,
  createNotFoundHandler,
  createRequestIdMiddleware
} from './monitoring.js';

type ServerContext = {
  accessLogs: unknown[];
  baseUrl: string;
  errorLogs: unknown[];
};

async function withServer<T>(run: (context: ServerContext) => Promise<T>): Promise<T> {
  const accessLogs: unknown[] = [];
  const errorLogs: unknown[] = [];
  const app = express();
  app.use(createRequestIdMiddleware());
  app.use(createAccessLogMiddleware((entry) => accessLogs.push(entry)));
  app.get('/ok', (_request, response) => response.json({ ok: true }));
  app.get('/boom', () => {
    throw new Error('boom');
  });
  app.use(createNotFoundHandler());
  app.use(createErrorHandler((entry) => errorLogs.push(entry)));

  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo | null;
  assert.ok(address);

  try {
    return await run({
      accessLogs,
      baseUrl: `http://127.0.0.1:${address.port}`,
      errorLogs
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    assert.ok(accessLogs.length >= 1);
  }
}

describe('monitoring middleware', () => {
  it('adds request ids and access logs for successful requests', async () => {
    await withServer(async ({ accessLogs, baseUrl }) => {
      const response = await fetch(`${baseUrl}/ok`, {
        headers: { 'x-request-id': 'req-test-1' }
      });
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-request-id'), 'req-test-1');
      assert.deepEqual(payload, { ok: true });
      assert.deepEqual(accessLogs[0], {
        duration_ms: (accessLogs[0] as { duration_ms: number }).duration_ms,
        event: 'http_request',
        method: 'GET',
        path: '/ok',
        request_id: 'req-test-1',
        status: 200
      });
    });
  });

  it('returns structured 404 responses', async () => {
    await withServer(async ({ accessLogs, baseUrl }) => {
      const response = await fetch(`${baseUrl}/missing`);
      const payload = await response.json();

      assert.equal(response.status, 404);
      assert.deepEqual(payload, {
        error: 'not_found',
        path: '/missing'
      });
      assert.equal((accessLogs[0] as { status: number }).status, 404);
    });
  });

  it('returns structured 500 responses without leaking error details', async () => {
    await withServer(async ({ baseUrl, errorLogs }) => {
      const response = await fetch(`${baseUrl}/boom`);
      const payload = await response.json();

      assert.equal(response.status, 500);
      assert.deepEqual(payload, { error: 'internal_error' });
      assert.deepEqual(errorLogs[0], {
        event: 'http_error',
        message: 'boom',
        request_id: (errorLogs[0] as { request_id: string }).request_id
      });
    });
  });

  it('builds ready, blocked, and watch launch states', () => {
    const baseSignals = {
      averageLatencyMs: 220,
      checkedAt: '2026-05-12T17:10:00.000Z',
      criticalErrorsLastHour: 0,
      databaseReady: true,
      openFeedbackItems: 3,
      version: '0.1.0'
    };
    const ready = buildLaunchStatus(baseSignals);
    const blocked = buildLaunchStatus({
      ...baseSignals,
      criticalErrorsLastHour: 2,
      databaseReady: false
    });
    const watch = buildLaunchStatus({
      ...baseSignals,
      averageLatencyMs: 1400,
      openFeedbackItems: 30
    });

    assert.equal(ready.status, 'ready');
    assert.deepEqual(ready.alerts, []);
    assert.equal(blocked.status, 'blocked');
    assert.equal(blocked.alerts.filter((alert) => alert.severity === 'critical').length, 2);
    assert.equal(watch.status, 'watch');
    assert.equal(watch.alerts.filter((alert) => alert.severity === 'warning').length, 2);
  });
});
