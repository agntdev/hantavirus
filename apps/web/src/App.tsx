import { lazy, Suspense, useEffect, useState } from 'react';
import './styles.css';
import { AppLayout } from './components/AppLayout.js';
import { StatStrip } from './components/StatStrip.js';
import { getInitialLocale, storeLocale, translations } from './i18n.js';

const ContentSection = lazy(() =>
  import('./components/ContentSection.js').then(({ ContentSection }) => ({
    default: ContentSection
  }))
);

const InfoCard = lazy(() =>
  import('./components/InfoCard.js').then(({ InfoCard }) => ({
    default: InfoCard
  }))
);

const AnalyticsDashboard = lazy(() =>
  import('./components/AnalyticsDashboard.js').then(({ AnalyticsDashboard }) => ({
    default: AnalyticsDashboard
  }))
);

export function App() {
  const [locale, setLocale] = useState(getInitialLocale);
  const copy = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    storeLocale(locale);
  }, [locale]);

  return (
    <AppLayout copy={copy.site} locale={locale} onLocaleChange={setLocale}>
      <main>
        <section className="hero-layout">
          <div>
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1>{copy.hero.title}</h1>
            <p>{copy.hero.description}</p>
            <div className="hero-actions" aria-label={copy.hero.actionsLabel}>
              <a className="button button-primary" href="#guidance">
                {copy.hero.primaryAction}
              </a>
              <a className="button button-secondary" href="#tracking">
                {copy.hero.secondaryAction}
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label={copy.hero.statusLabel}>
            <p>{copy.hero.panelLabel}</p>
            <strong>{copy.hero.panelTitle}</strong>
            <span>{copy.hero.panelDescription}</span>
          </aside>
        </section>

        <StatStrip items={copy.stats} />

        <Suspense fallback={null}>
          <ContentSection
            eyebrow={copy.sections.guidance.eyebrow}
            id="guidance"
            intro={copy.sections.guidance.intro}
            title={copy.sections.guidance.title}
          >
            <div className="card-grid">
              {copy.focusAreas.map((area) => (
                <InfoCard
                  accent={area.accent}
                  description={area.description}
                  key={area.title}
                  title={area.title}
                />
              ))}
            </div>
          </ContentSection>

          <ContentSection
            eyebrow={copy.sections.tracking.eyebrow}
            id="tracking"
            intro={copy.sections.tracking.intro}
            title={copy.sections.tracking.title}
          >
            <div className="split-layout">
              {copy.sections.tracking.cards.map((card) => (
                <InfoCard
                  accent={card.accent}
                  description={card.description}
                  key={card.title}
                  title={card.title}
                />
              ))}
            </div>
          </ContentSection>

          <ContentSection
            eyebrow="Analytics"
            id="analytics"
            intro="Track reader engagement, content performance, and site health across selectable time ranges."
            title="Dashboard for content and usage decisions"
          >
            <AnalyticsDashboard />
          </ContentSection>
        </Suspense>
      </main>
    </AppLayout>
  );
}
