import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { NotificationCenter } from '../src/components/NotificationCenter.js';
import {
  buildEmailDigest,
  defaultNotificationPreference,
  initialNotifications,
  markAllNotificationsRead,
  summarizeNotifications,
  toggleNotificationKind
} from '../src/notifications.js';

test('notification summary counts unread and total notifications', () => {
  assert.deepEqual(summarizeNotifications(initialNotifications), {
    total: 4,
    unread: 2
  });
});

test('markAllNotificationsRead clears unread state without dropping records', () => {
  const next = markAllNotificationsRead(initialNotifications);

  assert.equal(next.length, initialNotifications.length);
  assert.equal(next.every((notification) => notification.read), true);
});

test('email digest honors enabled categories and disabled state', () => {
  const filtered = toggleNotificationKind(
    defaultNotificationPreference,
    'forum_reply'
  );
  const digest = buildEmailDigest(initialNotifications, filtered);

  assert.ok(digest.includes('Prevention checklist updated'));
  assert.equal(digest.includes('New community reply'), false);
  assert.equal(
    buildEmailDigest(initialNotifications, {
      ...defaultNotificationPreference,
      emailDigest: false
    }),
    'Email digest is disabled.'
  );
});

test('NotificationCenter renders in-app notifications and email preferences', () => {
  const html = renderToStaticMarkup(React.createElement(NotificationCenter));

  assert.ok(html.includes('Notification center'));
  assert.ok(html.includes('Unread of'));
  assert.ok(html.includes('Mark all read'));
  assert.ok(html.includes('Email digest'));
  assert.ok(html.includes('Email alert preview'));
  assert.ok(html.includes('Prevention checklist updated'));
});
