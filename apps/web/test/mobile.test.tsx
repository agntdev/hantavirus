import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MobileSupport } from '../src/components/MobileSupport.js';
import {
  mobileCapabilities,
  registerMobileServiceWorker,
  requestPushPermission,
  summarizeMobileCapabilities
} from '../src/mobile.js';

test('mobile capability summary tracks offline and push readiness', () => {
  const summary = summarizeMobileCapabilities();

  assert.equal(summary.total, mobileCapabilities.length);
  assert.equal(summary.enabled, 3);
  assert.equal(summary.pushReady, true);
});

test('service worker registration uses the mobile worker path', async () => {
  const registrations: string[] = [];
  const registration = await registerMobileServiceWorker({
    serviceWorker: {
      register(path: string) {
        registrations.push(path);
        return Promise.resolve({ scope: path } as ServiceWorkerRegistration);
      }
    } as unknown as ServiceWorkerContainer
  });

  assert.equal(registrations[0], '/service-worker.js');
  assert.deepEqual(registration, { scope: '/service-worker.js' });
});

test('push permission helper requests permission when needed', async () => {
  const permission = await requestPushPermission({
    permission: 'default',
    requestPermission: () => Promise.resolve('granted')
  });

  assert.equal(permission, 'granted');
});

test('MobileSupport renders offline, install, push, and core workflow support', () => {
  const html = renderToStaticMarkup(React.createElement(MobileSupport));

  assert.ok(html.includes('Mobile app support'));
  assert.ok(html.includes('Offline access'));
  assert.ok(html.includes('Installable app'));
  assert.ok(html.includes('Push notifications'));
  assert.ok(html.includes('Core workflows'));
});
