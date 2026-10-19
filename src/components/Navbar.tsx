import React from 'react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';

export type NavTab = 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features';

interface NavbarProps {
  activeTab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features';
  onSelectTab: (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className="appbar">
      <div className="appbar-inner">
        {/* Brand Logo with exact Mark and Searchbook branding */}
        <button
          onClick={() => onSelectTab('home')}
          className="appbar-logo text-left flex items-center gap-2"
          aria-label="Searchbook Home"
          title="Return to Home"
        >
          <LogoMark />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            Searchbook
          </span>
        </button>

        {/* Navigation Sections with Dedicated SEO Pages */}
        <nav className="appbar-nav" aria-label="Main Navigation">
          <button
            onClick={() => onSelectTab('library')}
            className={`appbar-link ${activeTab === 'library' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.library')}
          </button>
          <button
            onClick={() => onSelectTab('features')}
            className={`appbar-link ${activeTab === 'features' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.features')}
          </button>
          <button
            onClick={() => onSelectTab('vocab')}
            className={`appbar-link ${activeTab === 'vocab' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.vocab')}
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`appbar-link ${activeTab === 'stats' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.stats')}
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`appbar-link ${activeTab === 'about' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.about')}
          </button>
          <button
            onClick={() => onSelectTab('contact')}
            className={`appbar-link ${activeTab === 'contact' ? 'appbar-link--active' : ''}`}
          >
            {t('nav.contact')}
          </button>
        </nav>

        {/* Actions & Utilities */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* 4-Language Segmented Switcher */}
                  <div style={{ display: 'inline-flex', border: '2px solid var(--ink)', background: '#fff' }}>
                    {(['en', 'es', 'fr', 'pt'] as const).map((lang, idx) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLocale(lang)}
                        style={{
                          border: 'none',
                          borderLeft: idx > 0 ? '1px solid var(--ink)' : 'none',
                          background: locale === lang ? 'var(--ink)' : '#fff',
                          color: locale === lang ? '#fff' : 'var(--ink)',
                          padding: '3px 7px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          transition: 'background 0.1s, color 0.1s',
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
      </div>
    </header>
  );
};
