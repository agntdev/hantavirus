import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { UpdateCenter } from '../src/components/UpdateCenter.js';
import { getUpdates, summarizeUpdates, updateItems } from '../src/updates.js';

test('updates can be filtered by status', () => {
  const released = getUpdates('released');

  assert.equal(getUpdates().length, updateItems.length);
  assert.equal(released.length, 1);
  assert.equal(released[0].id, 'faster-feedback-summary');
});

test('update summary tracks released, monitored, and compatible work', () => {
  const summary = summarizeUpdates();

  assert.equal(summary.total, 3);
  assert.equal(summary.released, 1);
  assert.equal(summary.monitored, 1);
  assert.equal(summary.compatible, 3);
});

test('UpdateCenter renders improvement status and compatibility notes', () => {
  const html = renderToStaticMarkup(React.createElement(UpdateCenter));

  assert.ok(html.includes('Updates and improvements'));
  assert.ok(html.includes('feedback and performance updates'));
  assert.ok(html.includes('Faster feedback summaries'));
  assert.ok(html.includes('No route or payload changes.'));
});
