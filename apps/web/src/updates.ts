export type UpdateStatus = 'monitoring' | 'planned' | 'released';

export type UpdateItem = {
  compatibility: string;
  id: string;
  impact: string;
  metric: string;
  source: 'bug_report' | 'feedback' | 'performance';
  status: UpdateStatus;
  title: string;
};

export const updateStatuses: Array<{ label: string; value: UpdateStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Released', value: 'released' },
  { label: 'Monitoring', value: 'monitoring' },
  { label: 'Planned', value: 'planned' }
];

export const updateItems: UpdateItem[] = [
  {
    compatibility: 'No route or payload changes.',
    id: 'faster-feedback-summary',
    impact: 'Feedback summary stays responsive during launch traffic.',
    metric: '30s cache with invalidation',
    source: 'performance',
    status: 'released',
    title: 'Faster feedback summaries'
  },
  {
    compatibility: 'Keeps existing notification preferences intact.',
    id: 'notification-digest-tuning',
    impact: 'Reduces noisy alerts while keeping critical updates visible.',
    metric: '4 alert categories',
    source: 'feedback',
    status: 'monitoring',
    title: 'Notification digest tuning'
  },
  {
    compatibility: 'Adds optional UI without changing current navigation.',
    id: 'mobile-offline-guides',
    impact: 'Makes prevention guidance easier to revisit on mobile.',
    metric: 'Top roadmap request',
    source: 'feedback',
    status: 'planned',
    title: 'Mobile offline guides'
  }
];

export function getUpdates(status: UpdateStatus | 'all' = 'all') {
  return updateItems.filter((item) => status === 'all' || item.status === status);
}

export function summarizeUpdates(items = updateItems) {
  return {
    compatible: items.filter((item) => item.compatibility.length > 0).length,
    monitored: items.filter((item) => item.status === 'monitoring').length,
    released: items.filter((item) => item.status === 'released').length,
    total: items.length
  };
}
