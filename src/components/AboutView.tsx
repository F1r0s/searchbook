import React, { useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  onNavigateHome: () => void;
  onNavigateLibrary: () => void;
}

export const AboutView: React.FC<Props> = ({ onNavigateHome, onNavigateLibrary }) => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('about.title')} – LibPDF`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  return (
    <article className="page" itemScope itemType="https://schema.org/AboutPage" style={{ padding: '0 0 60px' }}>
      <header className="masthead" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <Landmark size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            {t('about.title')}
          </h1>
        </div>
        <p className="masthead-stats">
          {t('about.lede')}
        </p>
      </header>

      <section className="about-grid" style={{ padding: 0 }}>
        <div className="about-story" style={{ fontSize: '16px', lineHeight: 1.75 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '12px' }}>
            {t('about.missionTitle')}
          </h2>
          <p>{t('about.missionP1')}</p>
          <p>{t('about.missionP2')}</p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '28px 0 10px', paddingTop: '16px', borderTop: '2px solid var(--hair)' }}>
            {t('about.archivesTitle')}
          </h2>
          <p>{t('about.archivesP')}</p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '28px 0 10px', paddingTop: '16px', borderTop: '2px solid var(--hair)' }}>
            {t('about.privacyTitle')}
          </h2>
          <p>{t('about.privacyP')}</p>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '24px', boxShadow: 'var(--hard)' }}>
            <span className="stat-tile-label" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800 }}>
              {t('about.boxHeading')}
            </span>
            <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li style={{ borderBottom: '1px solid var(--hair)', paddingBottom: '8px' }}>
                <strong>{t('about.formatsLabel')}</strong> {t('about.formatsVal')}
              </li>
              <li style={{ borderBottom: '1px solid var(--hair)', paddingBottom: '8px' }}>
                <strong>{t('about.metadataLabel')}</strong> {t('about.metadataVal')}
              </li>
              <li style={{ borderBottom: '1px solid var(--hair)', paddingBottom: '8px' }}>
                <strong>{t('about.typographyLabel')}</strong> {t('about.typographyVal')}
              </li>
              <li>
                <strong>{t('about.licenseLabel')}</strong> {t('about.licenseVal')}
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn--primary" onClick={onNavigateLibrary} style={{ flex: 1 }}>
              {t('about.browseBtn')}
            </button>
            <button type="button" className="btn" onClick={onNavigateHome}>
              {t('about.backBtn')}
            </button>
          </div>
        </aside>
      </section>
    </article>
  );
};