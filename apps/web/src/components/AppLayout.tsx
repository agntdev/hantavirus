import type { ReactNode } from 'react';

const navItems = [
  { href: '#guidance', label: 'Guidance' },
  { href: '#tracking', label: 'Tracking' },
  { href: '#community', label: 'Community' }
];

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="site-frame">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Hantavirus home">
          <span className="brand-mark">H</span>
          <span>
            <strong>Hantavirus Hub</strong>
            <small>Public health resource</small>
          </span>
        </a>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {children}

      <footer className="site-footer">
        <div>
          <strong>Hantavirus Hub</strong>
          <p>Educational content, outbreak awareness, and community support.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#guidance">Guidance</a>
          <a href="#tracking">Tracking</a>
          <a href="#community">Community</a>
        </nav>
      </footer>
    </div>
  );
}
