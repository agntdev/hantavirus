import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { OutbreakMap } from '../src/components/OutbreakMap.js';
import {
  getMapPoints,
  outbreakMapPoints,
  projectPoint,
  summarizeOutbreakPoints
} from '../src/outbreakMap.js';

test('outbreak map data filters by severity', () => {
  const high = getMapPoints('high');

  assert.equal(getMapPoints().length, outbreakMapPoints.length);
  assert.equal(high.length, 1);
  assert.equal(high[0].id, 'northern-review');
});

test('outbreak map projection keeps coordinates in percent bounds', () => {
  const projected = projectPoint(outbreakMapPoints[0]);

  assert.ok(projected.x >= 0 && projected.x <= 100);
  assert.ok(projected.y >= 0 && projected.y <= 100);
});

test('outbreak map summary counts cases and countries', () => {
  const summary = summarizeOutbreakPoints();

  assert.equal(summary.reports, 3);
  assert.equal(summary.cases, 6);
  assert.equal(summary.countries, 2);
});

test('OutbreakMap renders filters, statistics, and source-review labels', () => {
  const html = renderToStaticMarkup(React.createElement(OutbreakMap));

  assert.ok(html.includes('Interactive outbreak map'));
  assert.ok(html.includes('Severity'));
  assert.ok(html.includes('Southwest watch report'));
  assert.ok(html.includes('Source review required'));
});
