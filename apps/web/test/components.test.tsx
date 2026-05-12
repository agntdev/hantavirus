import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AppLayout } from '../src/components/AppLayout.js';
import { ContentSection } from '../src/components/ContentSection.js';
import { InfoCard } from '../src/components/InfoCard.js';
import { StatStrip } from '../src/components/StatStrip.js';
import { translations } from '../src/i18n.js';

test('InfoCard renders copy with the selected accent class', () => {
  const html = renderToStaticMarkup(
    React.createElement(InfoCard, {
      accent: 'red',
      description: 'Watch for fever, aches, and respiratory symptoms.',
      title: 'Symptoms and response'
    })
  );

  assert.ok(html.includes('class="info-card info-card-red"'));
  assert.ok(html.includes('Symptoms and response'));
  assert.ok(html.includes('Watch for fever'));
});

test('StatStrip renders each label and value as definition items', () => {
  const html = renderToStaticMarkup(
    React.createElement(StatStrip, {
      items: [
        { label: 'Content types', value: '5' },
        { label: 'Core workflows', value: '4' }
      ]
    })
  );

  assert.ok(html.includes('class="stat-strip"'));
  assert.ok(html.includes('<dt>Content types</dt>'));
  assert.ok(html.includes('<dd>5</dd>'));
  assert.ok(html.includes('<dt>Core workflows</dt>'));
  assert.ok(html.includes('<dd>4</dd>'));
});

test('ContentSection preserves ids, headings, intro copy, and children', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ContentSection,
      {
        eyebrow: 'Core areas',
        id: 'guidance',
        intro: 'Reusable cards establish the first content templates.',
        title: 'Built for clear public-health information'
      },
      React.createElement('p', null, 'Child content')
    )
  );

  assert.ok(html.includes('id="guidance"'));
  assert.ok(html.includes('Core areas'));
  assert.ok(html.includes('Built for clear public-health information'));
  assert.ok(html.includes('Reusable cards'));
  assert.ok(html.includes('Child content'));
});

test('AppLayout renders branded navigation, children, and footer links', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AppLayout,
      {
        copy: translations.en.site,
        locale: 'en',
        onLocaleChange: () => undefined
      },
      React.createElement('main', null, 'Page content')
    )
  );

  assert.ok(html.includes('aria-label="Hantavirus home"'));
  assert.ok(html.includes('Primary navigation'));
  assert.ok(html.includes('Guidance'));
  assert.ok(html.includes('Tracking'));
  assert.ok(html.includes('Community'));
  assert.ok(html.includes('Language'));
  assert.ok(html.includes('Page content'));
  assert.ok(html.includes('Educational content, outbreak awareness, and community support.'));
});
