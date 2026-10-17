import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export type Locale = 'en' | 'fr';

const translations: Record<Locale, any> = { en, fr };
const STORAGE_KEY = 'bookplate_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
  formatDate: (isoDate?: string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number) => string;
  statusLabel: (status: 'finished' | 'reading' | 'want_to_read' | 'dnf') => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale;
      if (saved === 'en' || saved === 'fr') return saved;
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('fr')) {
        return 'fr';
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (keyPath: string, variables?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      let result = translations[locale];

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Fallback to English dictionary
          let fallback = translations.en;
          for (const fbKey of keys) {
            if (fallback && typeof fallback === 'object' && fbKey in fallback) {
              fallback = fallback[fbKey];
            } else {
              return keyPath;
            }
          }
          result = fallback;
          break;
        }
      }

      if (typeof result !== 'string') return keyPath;

      if (variables) {
        return Object.entries(variables).reduce((acc, [varKey, val]) => {
          return acc.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(val));
        }, result);
      }

      return result;
    },
    [locale]
  );

  const formatDate = useCallback(
    (isoDate?: string, options?: Intl.DateTimeFormatOptions): string => {
      if (!isoDate) return '—';
      try {
        const d = new Date(isoDate + (isoDate.includes('T') ? '' : 'T00:00:00'));
        return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
          year: 'numeric',
          month: options?.month || 'short',
          day: options?.day || 'numeric',
          ...options,
        });
      } catch {
        return isoDate;
      }
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US').format(value);
    },
    [locale]
  );

  const statusLabel = useCallback(
    (status: 'finished' | 'reading' | 'want_to_read' | 'dnf'): string => {
      switch (status) {
        case 'finished':
          return locale === 'fr' ? 'Lu' : 'Read';
        case 'reading':
          return locale === 'fr' ? 'En cours' : 'Reading';
        case 'want_to_read':
          return locale === 'fr' ? 'À lire' : 'TBR';
        case 'dnf':
          return locale === 'fr' ? 'Abandonné' : "Didn't finish";
        default:
          return status;
      }
    },
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatNumber,
        statusLabel,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}