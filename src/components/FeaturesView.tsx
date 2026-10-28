import React, { useEffect } from 'react';
import { Layers, FileDown, Search, BookA, Globe } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  onNavigateLibrary: () => void;
  onNavigateHome: () => void;
}

export const FeaturesView: React.FC<Props> = ({ onNavigateLibrary, onNavigateHome }) => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('features.title')} – Readbook`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  return (
    <article className="page" itemScope itemType="https://schema.org/WebPage" style={{ padding: '0 0 60px' }}>
      <header className="masthead" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <Layers size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            {t('features.title')}
          </h1>
        </div>
        <p className="masthead-stats">
          {t('features.lede')}
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <FileDown size={24} strokeWidth={2.2} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f1Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f1Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <Search size={24} strokeWidth={2.2} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f2Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f2Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <BookA size={24} strokeWidth={2.2} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f3Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f3Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <Globe size={24} strokeWidth={2.2} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f4Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f4Desc')}
          </p>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button type="button" className="btn btn--primary" onClick={onNavigateLibrary}>
          {t('features.browseBtn')}
        </button>
        <button type="button" className="btn" onClick={onNavigateHome}>
          {t('features.backBtn')}
        </button>
      </div>
    </article>
  );
};