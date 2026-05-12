import { useMemo, useState } from 'react';
import {
  analyticsRanges,
  analyticsToCsv,
  getAnalyticsSnapshot,
  type AnalyticsRange,
  type RankedMetric
} from '../analytics.js';

function RankedBars({ items }: { items: RankedMetric[] }) {
  return (
    <div className="ranked-bars">
      {items.map((item) => (
        <div className="ranked-row" key={item.label}>
          <div className="ranked-row-heading">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const snapshot = getAnalyticsSnapshot(range);
  const csvHref = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(analyticsToCsv(snapshot))}`,
    [snapshot]
  );

  return (
    <section className="analytics-dashboard" aria-label="Analytics dashboard">
      <div className="analytics-toolbar">
        <label>
          <span>Time range</span>
          <select
            onChange={(event) => setRange(event.target.value as AnalyticsRange)}
            value={range}
          >
            {analyticsRanges.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <a className="button button-secondary" download={`analytics-${range}.csv`} href={csvHref}>
          Export CSV
        </a>
      </div>

      <div className="metric-grid">
        {snapshot.engagement.map((metric) => (
          <article className="metric-tile" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.change}</span>
          </article>
        ))}
      </div>

      <div className="analytics-panels">
        <article>
          <h3>Content performance</h3>
          <RankedBars items={snapshot.contentPerformance} />
        </article>
        <article>
          <h3>Site statistics</h3>
          <div className="site-stat-list">
            {snapshot.siteStats.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.change}</em>
              </div>
            ))}
          </div>
        </article>
        <article>
          <h3>Content category mix</h3>
          <RankedBars items={snapshot.categoryCounts} />
        </article>
      </div>
    </section>
  );
}
