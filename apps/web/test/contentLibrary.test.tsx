import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ContentLibrary } from '../src/components/ContentLibrary.js';
import {
  getLibraryItems,
  libraryItems,
  summarizeLibrary
} from '../src/contentLibrary.js';

test('content library filters educational assets by format', () => {
  const infographics = getLibraryItems('infographic');

  assert.equal(getLibraryItems().length, libraryItems.length);
  assert.equal(infographics.length, 1);
  assert.equal(infographics[0].id, 'response-pathway-infographic');
});

test('content library summary tracks formats and review state', () => {
  const summary = summarizeLibrary();

  assert.equal(summary.total, 4);
  assert.equal(summary.formats, 4);
  assert.equal(summary.expertReview, 2);
  assert.equal(summary.ready, 1);
});

test('ContentLibrary renders expert submission and source requirements', () => {
  const html = renderToStaticMarkup(React.createElement(ContentLibrary));

  assert.ok(html.includes('Educational content library'));
  assert.ok(html.includes('content assets and expert submissions'));
  assert.ok(html.includes('Expert content submission'));
  assert.ok(html.includes('Requires contact, credentials, source links'));
});
