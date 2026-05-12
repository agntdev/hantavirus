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

const NotificationCenter = lazy(() =>
  import('./components/NotificationCenter.js').then(({ NotificationCenter }) => ({
    default: NotificationCenter
  }))
);

const FeatureRoadmap = lazy(() =>
  import('./components/FeatureRoadmap.js').then(({ FeatureRoadmap }) => ({
    default: FeatureRoadmap
  }))
);

const UpdateCenter = lazy(() =>
  import('./components/UpdateCenter.js').then(({ UpdateCenter }) => ({
    default: UpdateCenter
  }))
);

const ContentLibrary = lazy(() =>
  import('./components/ContentLibrary.js').then(({ ContentLibrary }) => ({
    default: ContentLibrary
  }))
);

const MobileSupport = lazy(() =>
  import('./components/MobileSupport.js').then(({ MobileSupport }) => ({
    default: MobileSupport
  }))
);

const OutbreakMap = lazy(() =>
  import('./components/OutbreakMap.js').then(({ OutbreakMap }) => ({
    default: OutbreakMap
  }))
);

const AuthPanel = lazy(() =>
  import('./components/AuthPanel.js').then(({ AuthPanel }) => ({
    default: AuthPanel
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

          <ContentSection
            eyebrow="Notifications"
            id="community"
            intro="Keep content updates, forum activity, system alerts, and feedback status changes visible."
            title="Notification center for readers and contributors"
          >
            <NotificationCenter />
          </ContentSection>

          <ContentSection
            eyebrow="Roadmap"
            id="roadmap"
            intro="Rank requested features from feedback, usage signals, and accessibility impact."
            title="Community demand drives the next updates"
          >
            <FeatureRoadmap />
          </ContentSection>

          <ContentSection
            eyebrow="Updates"
            id="updates"
            intro="Track shipped fixes, monitored changes, and compatibility-safe follow-up work."
            title="Feedback and performance guide every update"
          >
            <UpdateCenter />
          </ContentSection>

          <ContentSection
            eyebrow="Library"
            id="library"
            intro="Organize articles, videos, infographics, and expert submissions before publication."
            title="Educational content waits for source-backed review"
          >
            <ContentLibrary />
          </ContentSection>

          <ContentSection
            eyebrow="Mobile"
            id="mobile"
            intro="Install the app, keep core workflows available offline, and prepare alert delivery."
            title="Mobile support for the full resource"
          >
            <MobileSupport />
          </ContentSection>

          <ContentSection
            eyebrow="Map"
            id="outbreak-map"
            intro="Filter report locations by severity and connect each point to source review."
            title="Outbreak tracking map for verified workflows"
          >
            <OutbreakMap />
          </ContentSection>

          <ContentSection
            eyebrow="Accounts"
            id="auth"
            intro="Create accounts, login securely, link social identity, and load profile sessions."
            title="Authentication for readers and contributors"
          >
            <AuthPanel />
          </ContentSection>
        </Suspense>
      </main>
    </AppLayout>
  );
}
