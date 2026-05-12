import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuthPanel } from '../src/components/AuthPanel.js';
import { authModes, passwordRequirements, summarizeAuthSurface } from '../src/authClient.js';

test('auth surface exposes login, register, and profile modes', () => {
  const summary = summarizeAuthSurface();

  assert.equal(authModes.length, 3);
  assert.equal(summary.modes, 3);
  assert.equal(summary.oauthProviders, 3);
  assert.equal(passwordRequirements.length, 3);
});

test('AuthPanel renders auth form and security requirements', () => {
  const html = renderToStaticMarkup(React.createElement(AuthPanel));

  assert.ok(html.includes('Authentication system'));
  assert.ok(html.includes('Login'));
  assert.ok(html.includes('Password rules'));
  assert.ok(html.includes('scrypt hash'));
  assert.ok(html.includes('bearer token'));
});
