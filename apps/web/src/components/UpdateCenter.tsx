import { useMemo, useState } from 'react';
import {
  getUpdates,
  summarizeUpdates,
  updateStatuses,
  type UpdateStatus
} from '../updates.js';

export function UpdateCenter() {
  const [status, setStatus] = useState<UpdateStatus | 'all'>('all');
  const updates = useMemo(() => getUpdates(status), [status]);
  const summary = summarizeUpdates();

  return (
    <section className="analytics-dashboard" aria-label="Updates and improvements">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.total}</strong>
          <span>feedback and performance updates</span>
        </div>
        <label>
          <span>Status</span>
          <select
            onChange={(event) => setStatus(event.target.value as UpdateStatus | 'all')}
            value={status}
          >
            {updateStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Released</p>
          <strong>{summary.released}</strong>
          <span>already shipped</span>
        </article>
        <article className="metric-tile">
          <p>Monitoring</p>
          <strong>{summary.monitored}</strong>
          <span>watched after launch</span>
        </article>
        <article className="metric-tile">
          <p>Compatible</p>
          <strong>{summary.compatible}</strong>
          <span>backward-safe changes</span>
        </article>
      </div>

      <div className="split-layout">
        {updates.map((item) => (
          <article className="info-card roadmap-item" key={item.id}>
            <p>{item.status}</p>
            <h3>{item.title}</h3>
            <span>{item.impact}</span>
            <dl>
              <div>
                <dt>Signal</dt>
                <dd>{item.source.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt>Metric</dt>
                <dd>{item.metric}</dd>
              </div>
            </dl>
            <small>{item.compatibility}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
