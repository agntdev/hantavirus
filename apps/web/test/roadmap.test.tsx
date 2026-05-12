import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FeatureRoadmap } from '../src/components/FeatureRoadmap.js';
import {
  featureRoadmap,
  getRoadmapItems,
  scoreRoadmapItem,
  summarizeRoadmap
} from '../src/roadmap.js';

test('roadmap ranks requested features by demand score', () => {
  const ranked = getRoadmapItems();

  assert.equal(ranked.length, featureRoadmap.length);
  assert.ok(scoreRoadmapItem(ranked[0]) >= scoreRoadmapItem(ranked[1]));
  assert.equal(ranked[0].id, 'offline-mobile-guides');
});

test('roadmap can filter by status and summarize the queue', () => {
  const building = getRoadmapItems('building');
  const summary = summarizeRoadmap();

  assert.equal(building.length, 1);
  assert.equal(summary.total, 3);
  assert.equal(summary.highestDemand.id, 'offline-mobile-guides');
});

test('FeatureRoadmap renders demand, feedback, and accessibility impact', () => {
  const html = renderToStaticMarkup(React.createElement(FeatureRoadmap));

  assert.ok(html.includes('Community feature roadmap'));
  assert.ok(html.includes('features ranked by demand'));
  assert.ok(html.includes('Offline mobile guides'));
  assert.ok(html.includes('Improves mobile reading'));
});
