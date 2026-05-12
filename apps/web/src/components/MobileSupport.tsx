import { useEffect, useState } from 'react';
import {
  mobileCapabilities,
  registerMobileServiceWorker,
  requestPushPermission,
  summarizeMobileCapabilities
} from '../mobile.js';

export function MobileSupport() {
  const [serviceWorkerState, setServiceWorkerState] = useState('checking');
  const [pushState, setPushState] = useState('not requested');
  const summary = summarizeMobileCapabilities();

  useEffect(() => {
    registerMobileServiceWorker()
      .then((registration) => setServiceWorkerState(registration ? 'registered' : 'unsupported'))
      .catch(() => setServiceWorkerState('unavailable'));
  }, []);

  return (
    <section className="analytics-dashboard" aria-label="Mobile app support">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.total}</strong>
          <span>mobile capabilities</span>
        </div>
        <button
          className="button button-secondary"
          onClick={() => {
            requestPushPermission().then((permission) => setPushState(permission));
          }}
          type="button"
        >
          Enable alerts
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Offline</p>
          <strong>{serviceWorkerState}</strong>
          <span>service worker cache</span>
        </article>
        <article className="metric-tile">
          <p>Push</p>
          <strong>{pushState}</strong>
          <span>{summary.pushReady ? 'handler ready' : 'not available'}</span>
        </article>
        <article className="metric-tile">
          <p>Enabled</p>
          <strong>{summary.enabled}</strong>
          <span>core mobile features</span>
        </article>
      </div>

      <div className="split-layout">
        {mobileCapabilities.map((item) => (
          <article className="info-card roadmap-item" key={item.label}>
            <p>{item.status}</p>
            <h3>{item.label}</h3>
            <span>{item.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
