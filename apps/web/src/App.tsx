import './styles.css';

const focusAreas = [
  'Prevention guidance',
  'Symptoms and response',
  'Outbreak tracking',
  'Community education'
];

export function App() {
  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Public health resource</p>
        <h1>Hantavirus information and prevention hub</h1>
        <p>
          A foundation for trustworthy educational content, outbreak awareness,
          and community support tools.
        </p>
      </section>

      <section className="focus-grid" aria-label="Initial project areas">
        {focusAreas.map((area) => (
          <article key={area}>
            <h2>{area}</h2>
            <p>Ready for detailed implementation in upcoming project tasks.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
