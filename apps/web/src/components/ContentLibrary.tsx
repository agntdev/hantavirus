import { useMemo, useState } from 'react';
import {
  contentFormats,
  getLibraryItems,
  summarizeLibrary,
  type ContentFormat
} from '../contentLibrary.js';

export function ContentLibrary() {
  const [format, setFormat] = useState<ContentFormat | 'all'>('all');
  const items = useMemo(() => getLibraryItems(format), [format]);
  const summary = summarizeLibrary();

  return (
    <section className="analytics-dashboard" aria-label="Educational content library">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.total}</strong>
          <span>content assets and expert submissions</span>
        </div>
        <label>
          <span>Format</span>
          <select
            onChange={(event) => setFormat(event.target.value as ContentFormat | 'all')}
            value={format}
          >
            {contentFormats.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Formats</p>
          <strong>{summary.formats}</strong>
          <span>article, video, infographic, expert lane</span>
        </article>
        <article className="metric-tile">
          <p>Expert review</p>
          <strong>{summary.expertReview}</strong>
          <span>queued before publishing</span>
        </article>
        <article className="metric-tile">
          <p>Ready</p>
          <strong>{summary.ready}</strong>
          <span>submission workflow live</span>
        </article>
      </div>

      <div className="split-layout">
        {items.map((item) => (
          <article className="info-card roadmap-item" key={item.id}>
            <p>{item.format.replace('_', ' ')}</p>
            <h3>{item.title}</h3>
            <span>{item.summary}</span>
            <dl>
              <div>
                <dt>Owner</dt>
                <dd>{item.owner}</dd>
              </div>
              <div>
                <dt>Review</dt>
                <dd>{item.reviewStatus.replace('_', ' ')}</dd>
              </div>
            </dl>
            <small>{item.sourceRequirement}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
