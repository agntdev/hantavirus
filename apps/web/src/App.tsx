import { lazy, Suspense } from 'react';
import './styles.css';
import { AppLayout } from './components/AppLayout.js';
import { StatStrip } from './components/StatStrip.js';

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

const focusAreas = [
  {
    accent: 'green' as const,
    description: 'Practical steps for reducing exposure risk in homes and workplaces.',
    title: 'Prevention guidance'
  },
  {
    accent: 'red' as const,
    description: 'Clear symptom summaries and response pathways for concerned readers.',
    title: 'Symptoms and response'
  },
  {
    accent: 'blue' as const,
    description: 'Structured reports for locations, case counts, severity, and sources.',
    title: 'Outbreak tracking'
  },
  {
    accent: 'gold' as const,
    description: 'Forum and review foundations for community and expert collaboration.',
    title: 'Community education'
  }
];

const stats = [
  { label: 'Content types', value: '5' },
  { label: 'Core workflows', value: '4' },
  { label: 'Responsive layouts', value: 'Ready' }
];

export function App() {
  return (
    <AppLayout>
      <main>
        <section className="hero-layout">
          <div>
            <p className="eyebrow">Public health resource</p>
            <h1>Hantavirus information and prevention hub</h1>
            <p>
              Trustworthy educational content, outbreak awareness, and community
              support tools for readers and public-health contributors.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button button-primary" href="#guidance">
                Browse guidance
              </a>
              <a className="button button-secondary" href="#tracking">
                View tracking
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Project status">
            <p>Foundation</p>
            <strong>Component system</strong>
            <span>Navigation, content sections, cards, and responsive grids.</span>
          </aside>
        </section>

        <StatStrip items={stats} />

        <Suspense fallback={null}>
          <ContentSection
            eyebrow="Core areas"
            id="guidance"
            intro="Reusable cards establish the first content templates for the project."
            title="Built for clear public-health information"
          >
            <div className="card-grid">
              {focusAreas.map((area) => (
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
            eyebrow="Templates"
            id="tracking"
            intro="The layout supports dashboard-style pages without changing the shell."
            title="Ready for tracking and reporting screens"
          >
            <div className="split-layout">
              <InfoCard
                accent="blue"
                description="Outbreak reports can use the same card shell for severity, source, and location summaries."
                title="Outbreak overview"
              />
              <InfoCard
                accent="gold"
                description="Review queues can use section headers and compact grid layouts for moderation work."
                title="Review workflow"
              />
            </div>
          </ContentSection>
        </Suspense>
      </main>
    </AppLayout>
  );
}
