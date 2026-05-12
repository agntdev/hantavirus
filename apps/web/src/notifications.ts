export type NotificationKind =
  | 'content_update'
  | 'forum_reply'
  | 'system_alert'
  | 'feedback_status';

export type NotificationPreference = {
  emailDigest: boolean;
  enabledKinds: NotificationKind[];
};

export type UserNotification = {
  createdAt: string;
  id: string;
  kind: NotificationKind;
  read: boolean;
  summary: string;
  title: string;
};

export const notificationKinds: Array<{
  kind: NotificationKind;
  label: string;
}> = [
  { kind: 'content_update', label: 'Content updates' },
  { kind: 'forum_reply', label: 'Forum replies' },
  { kind: 'system_alert', label: 'System alerts' },
  { kind: 'feedback_status', label: 'Feedback status' }
];

export const defaultNotificationPreference: NotificationPreference = {
  emailDigest: true,
  enabledKinds: notificationKinds.map((item) => item.kind)
};

export const initialNotifications: UserNotification[] = [
  {
    createdAt: '2026-05-12T15:40:00.000Z',
    id: 'notif-content-1',
    kind: 'content_update',
    read: false,
    summary: 'The prevention checklist was updated with cleaning and storage guidance.',
    title: 'Prevention checklist updated'
  },
  {
    createdAt: '2026-05-12T15:18:00.000Z',
    id: 'notif-forum-1',
    kind: 'forum_reply',
    read: false,
    summary: 'A moderator replied to the outbreak tracking discussion thread.',
    title: 'New community reply'
  },
  {
    createdAt: '2026-05-12T14:55:00.000Z',
    id: 'notif-system-1',
    kind: 'system_alert',
    read: true,
    summary: 'The feedback summary endpoint reported normal response times.',
    title: 'Monitoring check passed'
  },
  {
    createdAt: '2026-05-12T14:10:00.000Z',
    id: 'notif-feedback-1',
    kind: 'feedback_status',
    read: true,
    summary: 'A submitted content correction moved from new to triaged.',
    title: 'Feedback moved to triage'
  }
];

export function summarizeNotifications(notifications: UserNotification[]) {
  return {
    total: notifications.length,
    unread: notifications.filter((notification) => !notification.read).length
  };
}

export function markAllNotificationsRead(
  notifications: UserNotification[]
): UserNotification[] {
  return notifications.map((notification) => ({
    ...notification,
    read: true
  }));
}

export function buildEmailDigest(
  notifications: UserNotification[],
  preference: NotificationPreference
): string {
  if (!preference.emailDigest) {
    return 'Email digest is disabled.';
  }

  const selected = notifications.filter((notification) =>
    preference.enabledKinds.includes(notification.kind)
  );

  if (selected.length === 0) {
    return 'No enabled notification categories have updates.';
  }

  return selected
    .map((notification) => `${notification.title}: ${notification.summary}`)
    .join('\n');
}

export function toggleNotificationKind(
  preference: NotificationPreference,
  kind: NotificationKind
): NotificationPreference {
  const enabledKinds = preference.enabledKinds.includes(kind)
    ? preference.enabledKinds.filter((item) => item !== kind)
    : [...preference.enabledKinds, kind];

  return {
    ...preference,
    enabledKinds
  };
}
