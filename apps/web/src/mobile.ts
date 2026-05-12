export type MobileCapability = {
  detail: string;
  label: string;
  status: 'enabled' | 'ready';
};

export const mobileCapabilities: MobileCapability[] = [
  {
    detail: 'Service worker caches the app shell and recent GET responses.',
    label: 'Offline access',
    status: 'enabled'
  },
  {
    detail: 'Web app manifest supports standalone install on mobile homescreens.',
    label: 'Installable app',
    status: 'enabled'
  },
  {
    detail: 'Push handler displays content and community update notifications.',
    label: 'Push notifications',
    status: 'ready'
  },
  {
    detail: 'Existing guidance, analytics, notifications, roadmap, updates, and library panels stay available on narrow screens.',
    label: 'Core workflows',
    status: 'enabled'
  }
];

export function summarizeMobileCapabilities(items = mobileCapabilities) {
  return {
    enabled: items.filter((item) => item.status === 'enabled').length,
    pushReady: items.some((item) => item.label === 'Push notifications'),
    total: items.length
  };
}

export async function registerMobileServiceWorker(
  navigatorLike: Pick<Navigator, 'serviceWorker'> | undefined = globalThis.navigator
) {
  if (!navigatorLike || !('serviceWorker' in navigatorLike)) {
    return null;
  }

  return navigatorLike.serviceWorker.register('/service-worker.js');
}

export async function requestPushPermission(
  notificationLike: Pick<typeof Notification, 'permission' | 'requestPermission'> | undefined =
    globalThis.Notification
) {
  if (!notificationLike) return 'unsupported';
  if (notificationLike.permission === 'granted') return 'granted';
  return notificationLike.requestPermission();
}
