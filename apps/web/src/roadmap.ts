export type RoadmapStatus = 'building' | 'measuring' | 'planned';

export type FeatureRoadmapItem = {
  accessibilityImpact: string;
  analyticsScore: number;
  feedbackCount: number;
  id: string;
  requestedBy: string;
  status: RoadmapStatus;
  summary: string;
  title: string;
  votes: number;
};

export const roadmapStatuses: Array<{ label: string; value: RoadmapStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Building', value: 'building' },
  { label: 'Measuring', value: 'measuring' },
  { label: 'Planned', value: 'planned' }
];

export const featureRoadmap: FeatureRoadmapItem[] = [
  {
    accessibilityImpact: 'Improves mobile reading and low-bandwidth access.',
    analyticsScore: 88,
    feedbackCount: 31,
    id: 'offline-mobile-guides',
    requestedBy: 'Mobile readers',
    status: 'building',
    summary: 'Offline prevention checklists and saved guidance for poor connectivity.',
    title: 'Offline mobile guides',
    votes: 142
  },
  {
    accessibilityImpact: 'Makes updates easier to scan without reading every page.',
    analyticsScore: 74,
    feedbackCount: 24,
    id: 'personal-update-feed',
    requestedBy: 'Returning readers',
    status: 'measuring',
    summary: 'Personalized update feed based on followed topics and alert preferences.',
    title: 'Personal update feed',
    votes: 96
  },
  {
    accessibilityImpact: 'Helps contributors submit structured corrections faster.',
    analyticsScore: 62,
    feedbackCount: 18,
    id: 'expert-submission-flow',
    requestedBy: 'Expert contributors',
    status: 'planned',
    summary: 'Guided submission workflow for content corrections, sources, and review notes.',
    title: 'Expert submission flow',
    votes: 81
  }
];

export function scoreRoadmapItem(item: FeatureRoadmapItem): number {
  return Math.round(item.votes * 0.45 + item.feedbackCount * 1.8 + item.analyticsScore * 0.6);
}

export function getRoadmapItems(status: RoadmapStatus | 'all' = 'all') {
  return [...featureRoadmap]
    .filter((item) => status === 'all' || item.status === status)
    .sort((a, b) => scoreRoadmapItem(b) - scoreRoadmapItem(a));
}

export function summarizeRoadmap(items = featureRoadmap) {
  return {
    building: items.filter((item) => item.status === 'building').length,
    highestDemand: getRoadmapItems('all')[0],
    total: items.length
  };
}
