import { useMemo, useState } from 'react';
import {
  getMapPoints,
  projectPoint,
  severityFilters,
  summarizeOutbreakPoints,
  type OutbreakSeverity
} from '../outbreakMap.js';

export function OutbreakMap() {
  const [severity, setSeverity] = useState<OutbreakSeverity | 'all'>('all');
  const points = useMemo(() => getMapPoints(severity), [severity]);
  const summary = summarizeOutbreakPoints(points);

  return (
    <section className="analytics-dashboard" aria-label="Interactive outbreak map">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.reports}</strong>
          <span>filtered reports</span>
        </div>
        <label>
          <span>Severity</span>
          <select
            onChange={(event) => setSeverity(event.target.value as OutbreakSeverity | 'all')}
            value={severity}
          >
            {severityFilters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Cases</p>
          <strong>{summary.cases}</strong>
          <span>reported in filtered view</span>
        </article>
        <article className="metric-tile">
          <p>Countries</p>
          <strong>{summary.countries}</strong>
          <span>represented in current map</span>
        </article>
        <article className="metric-tile">
          <p>Sources</p>
          <strong>{points.length}</strong>
          <span>linked to review workflow</span>
        </article>
      </div>

      <div className="map-layout">
        <div className="map-stage" role="img" aria-label="Projected outbreak report locations">
          {points.map((point) => {
            const position = projectPoint(point);
            return (
              <span
                className={`map-point map-point-${point.severity}`}
                key={point.id}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                title={point.label}
              />
            );
          })}
        </div>
        <div className="notification-list">
          {points.map((point) => (
            <article className="info-card roadmap-item" key={point.id}>
              <p>{point.severity}</p>
              <h3>{point.label}</h3>
              <span>{point.region}, {point.countryCode} · updated {point.updatedAt}</span>
              <small>{point.sourceLabel}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
