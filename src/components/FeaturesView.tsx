import React, { useEffect } from 'react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';

interface Props {
  onNavigateLibrary: () => void;
  onNavigateHome: () => void;
}

export const FeaturesView: React.FC<Props> = ({ onNavigateLibrary, onNavigateHome }) => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('features.title')} – Searchbook`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  return (
    <article className="page" itemScope itemType="https://schema.org/WebPage" style={{ padding: '0 0 60px' }}>
      <header className="page-hero" style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '36px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px' }}>
            <LogoMark />
          </div>
          <span className="sec-kicker" style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 800 }}>
            {t('features.kicker')}
          </span>
        </div>

        <h1 className="page-title" style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
          {t('features.title')}
        </h1>

        <p className="page-lede" style={{ fontSize: '18px', color: 'var(--ink-soft)', marginTop: '16px', maxWidth: '64ch' }}>
          {t('features.lede')}
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <span className="sec-n" style={{ display: 'inline-block', marginBottom: '12px' }}>01</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f1Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f1Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <span className="sec-n" style={{ display: 'inline-block', marginBottom: '12px' }}>02</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f2Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f2Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <span className="sec-n" style={{ display: 'inline-block', marginBottom: '12px' }}>03</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>
            {t('features.f3Title')}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {t('features.f3Desc')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
          <span className="sec-n" style={{ display: 'inline-block', marginBottom: '12px' }}>04</span>
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