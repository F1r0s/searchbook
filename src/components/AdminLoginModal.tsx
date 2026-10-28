import React, { useState } from 'react';
import LogoMark from './LogoMark';

interface Props {
  isOpen: boolean;
  error?: string | null;
  onLogin: (password: string) => Promise<boolean>;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({
  isOpen,
  error: externalError,
  onLogin,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const success = await onLogin(password);
      if (success) {
        setPassword('');
        onClose();
      }
    } catch {
      setLocalError('Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = localError || externalError;

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '32px' }}
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close authentication prompt"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ width: '42px', height: '42px', margin: '0 auto 12px' }}>
            <LogoMark />
          </div>
          <h2
            className="form-heading"
            style={{ fontSize: '26px', margin: '6px 0 8px', letterSpacing: '-0.03em' }}
          >
            Curator Access
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
            Enter your administrative key to manage the catalog and sitemaps.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(194, 38, 26, 0.08)',
              border: '2px solid var(--danger)',
              padding: '10px 14px',
              color: 'var(--danger)',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label className="field">
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
              Master Security Key
            </span>
            <input
              type="password"
              autoFocus
              required
              placeholder="Enter owner secret / password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '15px',
                border: '2px solid var(--ink)',
                background: '#ffffff',
                fontFamily: 'inherit',
              }}
            />
          </label>

          <div className="dialog-actions" style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              style={{ flex: 1.4 }}
            >
              {isSubmitting ? 'Authenticating...' : 'Unlock Panel →'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '22px', borderTop: '1px solid var(--hair)', paddingTop: '14px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            Configured strictly via <code>VITE_ADMIN_PASSWORD</code> and <code>VITE_ADMIN_SECRET_KEY</code>.
          </span>
        </div>
      </div>
    </div>
  );
};