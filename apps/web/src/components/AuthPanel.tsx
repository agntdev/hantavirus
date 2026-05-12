import { useState } from 'react';
import { authModes, passwordRequirements, summarizeAuthSurface, type AuthMode } from '../authClient.js';

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>('login');
  const summary = summarizeAuthSurface();

  return (
    <section className="analytics-dashboard" aria-label="Authentication system">
      <div className="analytics-toolbar">
        <div>
          <strong>{summary.modes}</strong>
          <span>auth screens</span>
        </div>
        <label>
          <span>View</span>
          <select onChange={(event) => setMode(event.target.value as AuthMode)} value={mode}>
            {authModes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <article className="metric-tile">
          <p>Password rules</p>
          <strong>{summary.passwordRules}</strong>
          <span>scrypt-backed storage</span>
        </article>
        <article className="metric-tile">
          <p>OAuth</p>
          <strong>{summary.oauthProviders}</strong>
          <span>social providers wired</span>
        </article>
        <article className="metric-tile">
          <p>Session</p>
          <strong>30d</strong>
          <span>bearer token lifetime</span>
        </article>
      </div>

      <div className="split-layout">
        <form className="info-card roadmap-item" aria-label={`${mode} form`}>
          <p>{mode}</p>
          <h3>{mode === 'register' ? 'Create account' : mode === 'profile' ? 'Profile' : 'Login'}</h3>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          {mode === 'register' && (
            <label>
              Display name
              <input name="display_name" type="text" />
            </label>
          )}
          {mode !== 'profile' && (
            <label>
              Password
              <input name="password" type="password" />
            </label>
          )}
          <button className="button button-primary" type="button">
            {mode === 'register' ? 'Register' : mode === 'profile' ? 'Load profile' : 'Login'}
          </button>
        </form>
        <article className="info-card roadmap-item">
          <p>security</p>
          <h3>Email, OAuth, and profile sessions</h3>
          {passwordRequirements.map((requirement) => (
            <span key={requirement}>{requirement}</span>
          ))}
        </article>
      </div>
    </section>
  );
}
