import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import type pg from 'pg';
import { createOutbreakRouter, parseOutbreakReport } from './outbreaks.js';

type QueryCall = { params?: unknown[]; sql: string };
type QueryResult = { rows: unknown[] };

function createMockPool(results: QueryResult[] = []) {
  const calls: QueryCall[] = [];
  const pool = {
    async query(sql: string, params?: unknown[]) {
      calls.push({ params, sql });
      return results.shift() ?? { rows: [] };
    }
  } as unknown as pg.Pool;

  return { calls, pool };
}

async function withOutbreakServer<T>(
  pool: pg.Pool,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/outbreaks', createOutbreakRouter(pool));
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo | null;
  assert.ok(address);

  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

const reportId = '083b8f64-4db2-4f4b-b87d-01c7798f14c1';

describe('parseOutbreakReport', () => {
  it('normalizes country codes and accepts map coordinates', () => {
    const parsed = parseOutbreakReport({
      country_code: 'us',
      description: 'Reported source-backed outbreak awareness entry.',
      latitude: 38.5,
      longitude: -120.2,
      severity: 'moderate',
      title: 'Regional awareness report'
    });

    assert.equal(parsed.country_code, 'US');
    assert.equal(parsed.case_count, 0);
  });

  it('rejects invalid coordinates', () => {
    assert.throws(() =>
      parseOutbreakReport({
        country_code: 'US',
        description: 'Reported source-backed outbreak awareness entry.',
        latitude: 120,
        title: 'Invalid coordinate'
      })
    );
  });
});

describe('createOutbreakRouter', () => {
  it('lists outbreak reports with filters', async () => {
    const report = { id: reportId, severity: 'moderate', title: 'Regional report' };
    const { calls, pool } = createMockPool([{ rows: [report] }]);

    await withOutbreakServer(pool, async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/outbreaks/reports?status=reported&severity=moderate&country_code=us`
      );
      const payload = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(payload, { reports: [report] });
      assert.deepEqual(calls[0].params, ['reported', 'moderate', 'us']);
    });
  });

  it('creates outbreak reports and attaches sources', async () => {
    const report = { country_code: 'US', id: reportId, status: 'reported' };
    const source = { id: 'source-1', label: 'CDC', source_url: 'https://www.cdc.gov/hantavirus/' };
    const { calls, pool } = createMockPool([{ rows: [report] }, { rows: [source] }]);

    await withOutbreakServer(pool, async (baseUrl) => {
      const createResponse = await fetch(`${baseUrl}/outbreaks/reports`, {
        body: JSON.stringify({
          country_code: 'US',
          description: 'Reported source-backed outbreak awareness entry.',
          latitude: 38.5,
          longitude: -120.2,
          severity: 'moderate',
          title: 'Regional awareness report'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });
      const sourceResponse = await fetch(`${baseUrl}/outbreaks/reports/${reportId}/sources`, {
        body: JSON.stringify({
          label: 'CDC',
          source_url: 'https://www.cdc.gov/hantavirus/'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      });

      assert.equal(createResponse.status, 201);
      assert.equal(sourceResponse.status, 201);
      assert.match(calls[0].sql, /INSERT INTO outbreak_reports/);
      assert.match(calls[1].sql, /INSERT INTO outbreak_report_sources/);
    });
  });
});
