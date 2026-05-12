import { useMemo, useState } from 'react';
import {
  buildEmailDigest,
  defaultNotificationPreference,
  initialNotifications,
  markAllNotificationsRead,
  notificationKinds,
  summarizeNotifications,
  toggleNotificationKind,
  type NotificationKind
} from '../notifications.js';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [preference, setPreference] = useState(defaultNotificationPreference);
  const summary = summarizeNotifications(notifications);
  const digest = useMemo(
    () => buildEmailDigest(notifications, preference),
    [notifications, preference]
  );

  function handleToggleKind(kind: NotificationKind) {
    setPreference((current) => toggleNotificationKind(current, kind));
  }

  return (
    <section className="notification-center" aria-label="Notification center">
      <div className="notification-toolbar">
        <div>
          <strong>{summary.unread}</strong>
          <span>Unread of {summary.total}</span>
        </div>
        <button
          className="button button-secondary"
          onClick={() => setNotifications(markAllNotificationsRead(notifications))}
          type="button"
        >
          Mark all read
        </button>
      </div>

      <div className="notification-layout">
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              className={notification.read ? 'notification-item' : 'notification-item unread'}
              key={notification.id}
            >
              <div>
                <p>{notification.title}</p>
                <span>{notification.summary}</span>
              </div>
              <time dateTime={notification.createdAt}>
                {new Intl.DateTimeFormat('en', {
                  hour: 'numeric',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }).format(new Date(notification.createdAt))}
              </time>
            </article>
          ))}
        </div>

        <aside className="notification-settings" aria-label="Notification preferences">
          <label className="switch-row">
            <span>Email digest</span>
            <input
              checked={preference.emailDigest}
              onChange={(event) =>
                setPreference((current) => ({
                  ...current,
                  emailDigest: event.target.checked
                }))
              }
              type="checkbox"
            />
          </label>

          <div className="preference-list">
            {notificationKinds.map((item) => (
              <label key={item.kind}>
                <input
                  checked={preference.enabledKinds.includes(item.kind)}
                  onChange={() => handleToggleKind(item.kind)}
                  type="checkbox"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="email-preview">
            <p>Email alert preview</p>
            <pre>{digest}</pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
