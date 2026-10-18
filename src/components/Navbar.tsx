import React from 'react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';

export type NavTab = 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features';

interface NavbarProps {
    activeTab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features';
    onSelectTab: (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => void;
    onAddBook?: () => void;
    onOpenPseo?: () => void;
    onOpenBatchScrape?: () => void;
    isAdmin?: boolean;
    onExitAdmin?: () => void;
  }

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onAddBook,
  onOpenPseo,
  onOpenBatchScrape,
  isAdmin = false,
  onExitAdmin,
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
          {/* Language Switcher */}
          <div style={{ display: 'inline-flex', border: '2px solid var(--ink)' }}>
            <button
              type="button"
              onClick={() => setLocale('en')}
              style={{
                border: 'none',
                background: locale === 'en' ? 'var(--ink)' : '#fff',
                color: locale === 'en' ? '#fff' : 'var(--ink)',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('fr')}
              style={{
                border: 'none',
                borderLeft: '1px solid var(--ink)',
                background: locale === 'fr' ? 'var(--ink)' : '#fff',
                color: locale === 'fr' ? '#fff' : 'var(--ink)',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              FR
            </button>
          </div>

          {/* Admin Tools when in Admin Mode (Triggered via /secretadmin2026) */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a
                href="#secretadmin2026"
                className="btn btn--sm"
                style={{ fontSize: '11px', padding: '5px 8px', textDecoration: 'none', background: 'var(--paper-deep)' }}
                title="Go to secret curator dashboard"
              >
                Cockpit
              </a>

              {onOpenPseo && (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={onOpenPseo}
                  title="Open pSEO & Sitemap configuration"
                  style={{ fontSize: '11px', padding: '5px 8px' }}
                >
                  pSEO
                </button>
              )}

              {onOpenBatchScrape && (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={onOpenBatchScrape}
                  title="Batch scrape book metadata without cloud storage"
                  style={{ fontSize: '11px', padding: '5px 8px' }}
                >
                  ⚡ Scraper
                </button>
              )}

              {onAddBook && (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={onAddBook}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  {t('nav.addBook')}
                </button>
              )}

              <span style={{ fontSize: '10px', fontWeight: 800, background: 'var(--accent)', color: '#fff', padding: '3px 6px', letterSpacing: '0.05em' }}>
                ADMIN
              </span>

              {onExitAdmin && (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={onExitAdmin}
                  title="Exit admin mode to public view"
                  style={{ fontSize: '11px', padding: '3px 7px' }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
