import type { ReactNode } from 'react';
import type { Locale, SiteCopy } from '../i18n.js';
import { LanguageSelector } from './LanguageSelector.js';

type AppLayoutProps = {
  children: ReactNode;
  copy: SiteCopy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

export function AppLayout({
  children,
  copy,
  locale,
  onLocaleChange
}: AppLayoutProps) {
  const navItems = [
    { href: '#guidance', label: copy.nav.guidance },
    { href: '#tracking', label: copy.nav.tracking },
    { href: '#community', label: copy.nav.community }
  ];

  return (
    <div className="site-frame">
      <header className="site-header">
        <a className="brand" href="/" aria-label={copy.homeLabel}>
          <span className="brand-mark">H</span>
          <span>
            <strong>{copy.brandName}</strong>
            <small>{copy.tagline}</small>
          </span>
        </a>

        <div className="header-actions">
          <nav className="site-nav" aria-label={copy.primaryNavigationLabel}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <LanguageSelector
            label={copy.languageLabel}
            locale={locale}
            onChange={onLocaleChange}
          />
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div>
          <strong>{copy.brandName}</strong>
          <p>{copy.footerDescription}</p>
        </div>
        <nav aria-label={copy.footerNavigationLabel}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
