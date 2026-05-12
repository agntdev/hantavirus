import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { analyticsToCsv, getAnalyticsSnapshot } from '../src/analytics.js';
import { AnalyticsDashboard } from '../src/components/AnalyticsDashboard.js';

test('analytics snapshots expose engagement, content, site, and category data', () => {
  const snapshot = getAnalyticsSnapshot('30d');

  assert.equal(snapshot.range, '30d');
  assert.equal(snapshot.engagement.length, 3);
  assert.equal(snapshot.contentPerformance.length, 3);
  assert.equal(snapshot.siteStats.length, 3);
  assert.equal(snapshot.categoryCounts.length, 4);
});

test('analytics export includes all dashboard sections', () => {
  const csv = analyticsToCsv(getAnalyticsSnapshot('7d'));

  assert.ok(csv.includes('"engagement"'));
  assert.ok(csv.includes('"site_stats"'));
  assert.ok(csv.includes('"content_performance"'));
  assert.ok(csv.includes('"category_counts"'));
});

test('AnalyticsDashboard renders filters, metrics, visual sections, and export', () => {
  const html = renderToStaticMarkup(React.createElement(AnalyticsDashboard));

  assert.ok(html.includes('Analytics dashboard'));
  assert.ok(html.includes('Time range'));
  assert.ok(html.includes('Export CSV'));
  assert.ok(html.includes('Active readers'));
  assert.ok(html.includes('Content performance'));
  assert.ok(html.includes('Site statistics'));
  assert.ok(html.includes('Content category mix'));
});
