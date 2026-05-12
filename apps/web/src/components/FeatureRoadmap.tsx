import { useMemo, useState } from 'react';
import {
  getRoadmapItems,
  roadmapStatuses,
  scoreRoadmapItem,
  summarizeRoadmap,
  type RoadmapStatus
} from '../roadmap.js';

export function FeatureRoadmap() {
  const [status, setStatus] = useState<RoadmapStatus | 'all'>('all');
  const items = useMemo(() => getRoadmapItems(status), [status]);
  const summary = summarizeRoadmap();

  return (
    <section className="analytics-dashboard" aria-label="Community feature roadmap">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.total}</strong>
          <span>features ranked by demand</span>
        </div>
        <label>
          <span>Status</span>
          <select
            onChange={(event) => setStatus(event.target.value as RoadmapStatus | 'all')}
            value={status}
          >
            {roadmapStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Building now</p>
          <strong>{summary.building}</strong>
          <span>highest-priority updates</span>
        </article>
        <article className="metric-tile">
          <p>Top request</p>
          <strong>{summary.highestDemand.votes}</strong>
          <span>{summary.highestDemand.title}</span>
        </article>
        <article className="metric-tile">
          <p>Total ideas</p>
          <strong>{summary.total}</strong>
          <span>from analytics and feedback</span>
        </article>
      </div>

      <div className="roadmap-list split-layout">
        {items.map((item) => (
          <article className="info-card roadmap-item" key={item.id}>
            <div>
              <p>{item.status}</p>
              <h3>{item.title}</h3>
              <span>{item.summary}</span>
            </div>
            <dl>
              <div>
                <dt>Demand</dt>
                <dd>{scoreRoadmapItem(item)}</dd>
              </div>
              <div>
                <dt>Feedback</dt>
                <dd>{item.feedbackCount}</dd>
              </div>
            </dl>
            <small>{item.accessibilityImpact}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
