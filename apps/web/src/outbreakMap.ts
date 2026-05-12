export type OutbreakSeverity = 'critical' | 'high' | 'low' | 'moderate';

export type OutbreakMapPoint = {
  caseCount: number;
  countryCode: string;
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  region: string;
  severity: OutbreakSeverity;
  sourceLabel: string;
  updatedAt: string;
};

export const severityFilters: Array<{ label: string; value: OutbreakSeverity | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Low', value: 'low' }
];

export const outbreakMapPoints: OutbreakMapPoint[] = [
  {
    caseCount: 2,
    countryCode: 'US',
    id: 'southwest-watch',
    label: 'Southwest watch report',
    latitude: 36.1,
    longitude: -111.9,
    region: 'Southwest',
    severity: 'moderate',
    sourceLabel: 'Public-health source pending verification',
    updatedAt: '2026-05-12'
  },
  {
    caseCount: 0,
    countryCode: 'US',
    id: 'field-education',
    label: 'Field education request',
    latitude: 39.7,
    longitude: -104.9,
    region: 'Mountain West',
    severity: 'low',
    sourceLabel: 'Community intake',
    updatedAt: '2026-05-11'
  },
  {
    caseCount: 4,
    countryCode: 'CA',
    id: 'northern-review',
    label: 'Northern review queue',
    latitude: 53.5,
    longitude: -113.5,
    region: 'Northern region',
    severity: 'high',
    sourceLabel: 'Source review required',
    updatedAt: '2026-05-10'
  }
];

export function getMapPoints(severity: OutbreakSeverity | 'all' = 'all') {
  return outbreakMapPoints.filter((point) => severity === 'all' || point.severity === severity);
}

export function projectPoint(point: OutbreakMapPoint) {
  return {
    x: Math.round(((point.longitude + 180) / 360) * 100),
    y: Math.round(((90 - point.latitude) / 180) * 100)
  };
}

export function summarizeOutbreakPoints(points = outbreakMapPoints) {
  return {
    cases: points.reduce((sum, point) => sum + point.caseCount, 0),
    countries: new Set(points.map((point) => point.countryCode)).size,
    reports: points.length
  };
}
