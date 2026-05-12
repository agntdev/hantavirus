import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultLocale, locales, resolveLocale, translations } from '../src/i18n.js';

test('translation bundles cover at least five selectable locales', () => {
  assert.ok(locales.length >= 5);

  for (const locale of locales) {
    const copy = translations[locale.code];

    assert.ok(copy.site.languageLabel.length > 0);
    assert.ok(copy.site.primaryNavigationLabel.length > 0);
    assert.ok(copy.site.nav.guidance.length > 0);
    assert.ok(copy.site.nav.tracking.length > 0);
    assert.ok(copy.site.nav.community.length > 0);
    assert.ok(copy.hero.title.length > 0);
    assert.equal(copy.focusAreas.length, 4);
    assert.equal(copy.stats.length, 3);
    assert.equal(copy.sections.tracking.cards.length, 2);
  }
});

test('locale resolution falls back safely for unsupported values', () => {
  assert.equal(resolveLocale('es'), 'es');
  assert.equal(resolveLocale('fr'), 'fr');
  assert.equal(resolveLocale('zz'), defaultLocale);
  assert.equal(resolveLocale(null), defaultLocale);
});
