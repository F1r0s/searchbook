import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import pt from '../locales/pt.json';

export type Locale = 'en' | 'es' | 'fr' | 'pt';

const translations: Record<Locale, any> = { en, es, fr, pt };
const STORAGE_KEY = 'searchbook_locale';

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
      if (saved === 'en' || saved === 'es' || saved === 'fr' || saved === 'pt') return saved;
      if (typeof navigator !== 'undefined') {
        const lang = navigator.language?.toLowerCase() || '';
        if (lang.startsWith('es')) return 'es';
        if (lang.startsWith('fr')) return 'fr';
        if (lang.startsWith('pt')) return 'pt';
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

  const getIntlLocale = (l: Locale): string => {
    switch (l) {
      case 'es':
        return 'es-ES';
      case 'fr':
        return 'fr-FR';
      case 'pt':
        return 'pt-PT';
      default:
        return 'en-US';
    }
  };

  const formatDate = useCallback(
    (isoDate?: string, options?: Intl.DateTimeFormatOptions): string => {
      if (!isoDate) return '—';
      try {
        const d = new Date(isoDate + (isoDate.includes('T') ? '' : 'T00:00:00'));
        return d.toLocaleDateString(getIntlLocale(locale), {
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
      return new Intl.NumberFormat(getIntlLocale(locale)).format(value);
    },
    [locale]
  );

  const statusLabel = useCallback(
    (status: 'finished' | 'reading' | 'want_to_read' | 'dnf'): string => {
      switch (status) {
        case 'finished':
          return locale === 'es' ? 'Leído' : locale === 'fr' ? 'Lu' : locale === 'pt' ? 'Lido' : 'Read';
        case 'reading':
          return locale === 'es' ? 'Leyendo' : locale === 'fr' ? 'En cours' : locale === 'pt' ? 'Lendo' : 'Reading';
        case 'want_to_read':
          return locale === 'es' ? 'Por leer' : locale === 'fr' ? 'À lire' : locale === 'pt' ? 'Para ler' : 'TBR';
        case 'dnf':
          return locale === 'es' ? 'Abandonado' : locale === 'fr' ? 'Abandonné' : locale === 'pt' ? 'Não finalizado' : "Didn't finish";
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