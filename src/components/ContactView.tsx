import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  onNavigateHome: () => void;
}

export const ContactView: React.FC<Props> = ({ onNavigateHome }) => {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = `${t('contact.title')} – Readbook`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <article className="page" itemScope itemType="https://schema.org/ContactPage" style={{ padding: '0 0 60px' }}>
      <header className="masthead" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <Mail size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            {t('contact.title')}
          </h1>
        </div>
        <p className="masthead-stats">
          {t('contact.lede')}
        </p>
      </header>

      <section style={{ maxWidth: '640px', margin: '0 auto' }}>
        {submitted ? (
          <div style={{ background: '#fff', border: '3px solid var(--ink)', padding: '36px', boxShadow: 'var(--hard-lg)', textAlign: 'center' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--accent)', margin: '0 auto 12px', display: 'block' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: '0 0 10px' }}>
              {t('contact.successTitle')}
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px' }}>
              {t('contact.successText')}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
                onNavigateHome();
              }}
            >
              {t('contact.returnBtn')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-card" style={{ background: '#fff', border: '3px solid var(--ink)', padding: '32px', boxShadow: 'var(--hard-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field">
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                {t('contact.emailLabel')}
              </span>
              <input
                type="email"
                placeholder={t('contact.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '10px 12px', border: '2px solid var(--ink)', fontSize: '15px', background: '#fff' }}
              />
            </div>

            <div className="field">
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                {t('contact.subjectLabel')}
              </span>
              <input
                type="text"
                placeholder={t('contact.subjectPlaceholder')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ padding: '10px 12px', border: '2px solid var(--ink)', fontSize: '15px', background: '#fff' }}
              />
            </div>

            <div className="field">
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                {t('contact.messageLabel')}
              </span>
              <textarea
                required
                rows={5}
                placeholder={t('contact.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ padding: '10px 12px', border: '2px solid var(--ink)', fontSize: '15px', background: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <button type="button" className="btn" onClick={onNavigateHome}>
                {t('contact.cancelBtn')}
              </button>
              <button type="submit" className="btn btn--primary">
                {t('contact.sendBtn')}
              </button>
            </div>
          </form>
        )}
      </section>
    </article>
  );
};