export type AnalyticsRange = '7d' | '30d' | '90d';

export type AnalyticsMetric = {
  change: string;
  label: string;
  value: string;
};

export type RankedMetric = {
  label: string;
  percent: number;
  value: string;
};

export type AnalyticsSnapshot = {
  categoryCounts: RankedMetric[];
  contentPerformance: RankedMetric[];
  engagement: AnalyticsMetric[];
  range: AnalyticsRange;
  siteStats: AnalyticsMetric[];
};

export const analyticsRanges: Array<{ label: string; value: AnalyticsRange }> = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' }
];

const snapshots: Record<AnalyticsRange, AnalyticsSnapshot> = {
  '7d': {
    categoryCounts: [
      { label: 'Prevention guidance', percent: 42, value: '42%' },
      { label: 'Symptoms and response', percent: 31, value: '31%' },
      { label: 'Outbreak tracking', percent: 18, value: '18%' },
      { label: 'Community education', percent: 9, value: '9%' }
    ],
    contentPerformance: [
      { label: 'Prevention checklist', percent: 88, value: '1,420 views' },
      { label: 'Symptom guide', percent: 71, value: '1,146 views' },
      { label: 'Outbreak overview', percent: 54, value: '874 views' }
    ],
    engagement: [
      { change: '+12%', label: 'Active readers', value: '2,480' },
      { change: '+8%', label: 'Guidance opens', value: '1,906' },
      { change: '+5%', label: 'Feedback submissions', value: '37' }
    ],
    range: '7d',
    siteStats: [
      { change: '-9%', label: 'Bounce rate', value: '34%' },
      { change: '+11%', label: 'Average session', value: '3m 12s' },
      { change: '+4%', label: 'Return visits', value: '28%' }
    ]
  },
  '30d': {
    categoryCounts: [
      { label: 'Prevention guidance', percent: 39, value: '39%' },
      { label: 'Symptoms and response', percent: 28, value: '28%' },
      { label: 'Outbreak tracking', percent: 22, value: '22%' },
      { label: 'Community education', percent: 11, value: '11%' }
    ],
    contentPerformance: [
      { label: 'Prevention checklist', percent: 91, value: '6,980 views' },
      { label: 'Symptom guide', percent: 76, value: '5,822 views' },
      { label: 'Outbreak overview', percent: 63, value: '4,826 views' }
    ],
    engagement: [
      { change: '+18%', label: 'Active readers', value: '8,940' },
      { change: '+14%', label: 'Guidance opens', value: '7,112' },
      { change: '+9%', label: 'Feedback submissions', value: '142' }
    ],
    range: '30d',
    siteStats: [
      { change: '-7%', label: 'Bounce rate', value: '36%' },
      { change: '+9%', label: 'Average session', value: '3m 04s' },
      { change: '+6%', label: 'Return visits', value: '31%' }
    ]
  },
  '90d': {
    categoryCounts: [
      { label: 'Prevention guidance', percent: 36, value: '36%' },
      { label: 'Symptoms and response', percent: 29, value: '29%' },
      { label: 'Outbreak tracking', percent: 24, value: '24%' },
      { label: 'Community education', percent: 11, value: '11%' }
    ],
    contentPerformance: [
      { label: 'Prevention checklist', percent: 94, value: '19,240 views' },
      { label: 'Symptom guide', percent: 82, value: '16,784 views' },
      { label: 'Outbreak overview', percent: 69, value: '14,119 views' }
    ],
    engagement: [
      { change: '+23%', label: 'Active readers', value: '24,660' },
      { change: '+19%', label: 'Guidance opens', value: '20,418' },
      { change: '+13%', label: 'Feedback submissions', value: '481' }
    ],
    range: '90d',
    siteStats: [
      { change: '-11%', label: 'Bounce rate', value: '33%' },
      { change: '+15%', label: 'Average session', value: '3m 28s' },
      { change: '+10%', label: 'Return visits', value: '35%' }
    ]
  }
};

export function getAnalyticsSnapshot(range: AnalyticsRange): AnalyticsSnapshot {
  return snapshots[range];
}

export function analyticsToCsv(snapshot: AnalyticsSnapshot): string {
  const rows = [
    ['range', 'section', 'label', 'value', 'change_or_percent'],
    ...snapshot.engagement.map((metric) => [
      snapshot.range,
      'engagement',
      metric.label,
      metric.value,
      metric.change
    ]),
    ...snapshot.siteStats.map((metric) => [
      snapshot.range,
      'site_stats',
      metric.label,
      metric.value,
      metric.change
    ]),
    ...snapshot.contentPerformance.map((metric) => [
      snapshot.range,
      'content_performance',
      metric.label,
      metric.value,
      `${metric.percent}%`
    ]),
    ...snapshot.categoryCounts.map((metric) => [
      snapshot.range,
      'category_counts',
      metric.label,
      metric.value,
      `${metric.percent}%`
    ])
  ];

  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');
}
