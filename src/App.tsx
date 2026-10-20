import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LibraryView } from './components/LibraryView';
import { VocabularyView } from './components/VocabularyView';
import StatsView from './components/StatsView';
import { LandingView } from './components/LandingView';
import { PseoBookLandingView } from './components/PseoBookLandingView';
import { LibraryStore } from './services/library-store';
import { Book, VocabularyWord } from './types';
import { useI18n } from './lib/i18n';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { FeaturesView } from './components/FeaturesView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features'>('home');
  const [initialBookSlug, setInitialBookSlug] = useState<string | null>(null);
  const [pseoBook, setPseoBook] = useState<Book | null>(null);
  const { t, locale, setLocale } = useI18n();

  // Library state
  const [books, setBooks] = useState<Book[]>([]);
  const [vocab, setVocab] = useState<VocabularyWord[]>([]);

  const refreshLibraryData = () => {
    setBooks(LibraryStore.getBooks());
    setVocab(LibraryStore.getVocabulary());
  };

  useEffect(() => {
    refreshLibraryData();

    // Check URL path and clean legacy hashes for clean SEO URLs
    const handleLocationChange = () => {
      const rawHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '').trim() : '';
      let pathname = typeof window !== 'undefined' ? window.location.pathname : '';

      // Clean up legacy hash if present (e.g. /# or /#library)
      if (typeof window !== 'undefined' && window.location.hash) {
        const cleanTarget = rawHash && rawHash !== 'home' ? rawHash : '';
        const currentLang = locale || 'en';
        const redirectedPath = cleanTarget ? `/${currentLang}/${cleanTarget}` : `/${currentLang}`;
        window.history.replaceState(null, '', redirectedPath);
        pathname = redirectedPath;
      }

      // Check for language prefix: /en, /es, /fr, /pt
      const langMatch = pathname.match(/^\/(en|es|fr|pt)(?:\/|$)(.*)/i);
      let detectedLang: 'en' | 'es' | 'fr' | 'pt' | null = null;
      let routePart = pathname;

      if (langMatch) {
        detectedLang = langMatch[1].toLowerCase() as any;
        routePart = langMatch[2] || '';
      } else {
        routePart = pathname.replace(/^\/+/, '');
      }

      if (detectedLang && detectedLang !== locale) {
        setLocale(detectedLang);
      }

      // Check for clean pSEO book route: books/:slug or direct book slug
      const bookMatch = routePart.match(/^books\/([^/?#]+)/i);
      const isKnownTab = ['home', 'library', 'vocab', 'stats', 'about', 'contact', 'features'].includes(routePart);
      const targetSlug = bookMatch ? bookMatch[1] : (!isKnownTab && routePart && !routePart.includes('/') ? routePart : null);

      if (targetSlug) {
        const allBooks = LibraryStore.getBooks();
        const found = allBooks.find((b) => b.slug === targetSlug || b.id === targetSlug);
        if (found) {
          setPseoBook(found);
          setInitialBookSlug(null);
          document.title = `${found.title} by ${found.author} – Searchbook`;
          return;
        }
      }

      setPseoBook(null);

      if (!routePart || routePart === 'home') {
        setActiveTab('home');
        setInitialBookSlug(null);
        document.title = 'Searchbook – The Open Digital Library';
        return;
      }

      if (routePart === 'vocab') {
        setActiveTab('vocab');
        setInitialBookSlug(null);
        document.title = 'Vocabulary Registry – Searchbook';
      } else if (routePart === 'stats') {
        setActiveTab('stats');
        setInitialBookSlug(null);
        document.title = 'Reading Statistics – Searchbook';
      } else if (routePart === 'about') {
        setActiveTab('about');
        setInitialBookSlug(null);
        document.title = 'About – Searchbook Digital Library';
      } else if (routePart === 'contact') {
        setActiveTab('contact');
        setInitialBookSlug(null);
        document.title = 'Contact – Searchbook Digital Library';
      } else if (routePart === 'features') {
        setActiveTab('features');
        setInitialBookSlug(null);
        document.title = 'Features – Searchbook Digital Library';
      } else if (routePart === 'library') {
        setActiveTab('library');
        setInitialBookSlug(null);
        document.title = 'Digital Library & Archives – Searchbook';
      } else {
        setActiveTab('library');
        setInitialBookSlug(routePart);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [locale]);

  const handleSelectTab = (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => {
    setPseoBook(null);
    setActiveTab(tab);
    setInitialBookSlug(null);
    const langPrefix = `/${locale || 'en'}`;
    const newPath = tab === 'home' ? langPrefix : `${langPrefix}/${tab}`;
    window.history.pushState(null, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Home page and no direct book is being viewed, render presentation view
  if (activeTab === 'home' && !pseoBook) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LandingView
          onOpenAdmin={() => handleSelectTab('library')}
          onNavigate={handleSelectTab}
        />
      </div>
    );
  }

  // Primary Public Bookshelf & Reader App
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* BookSearch AppBar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Public Library Container */}
      <main className="page" style={{ flex: 1, width: '100%' }}>
        {pseoBook ? (
          <PseoBookLandingView
            book={pseoBook}
            onNavigateLibrary={() => handleSelectTab('library')}
            onNavigateHome={() => handleSelectTab('home')}
          />
        ) : activeTab === 'library' ? (
          <LibraryView
            books={books}
            onBookUpdated={refreshLibraryData}
            initialBookSlug={initialBookSlug}
          />
        ) : activeTab === 'about' ? (
          <AboutView
            onNavigateHome={() => handleSelectTab('home')}
            onNavigateLibrary={() => handleSelectTab('library')}
          />
        ) : activeTab === 'contact' ? (
          <ContactView onNavigateHome={() => handleSelectTab('home')} />
        ) : activeTab === 'features' ? (
          <FeaturesView
            onNavigateLibrary={() => handleSelectTab('library')}
            onNavigateHome={() => handleSelectTab('home')}
          />
        ) : activeTab === 'vocab' ? (
          <VocabularyView
            vocabulary={vocab}
            onVocabUpdated={refreshLibraryData}
            onNavigateToBook={() => handleSelectTab('library')}
          />
        ) : activeTab === 'stats' ? (
          <StatsView books={books} />
        ) : null}
      </main>

      {/* Public Footer */}
      <footer
        style={{
          borderTop: '2px solid var(--line)',
          background: 'var(--paper-deep)',
          padding: '24px 28px',
          marginTop: 'auto',
          fontSize: '12px',
          color: 'var(--ink-soft)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '14px' }}>
              Searchbook
            </strong>{' '}
            — An open reading library &amp; digital ledger. Browse, search, and read volumes online.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleSelectTab('home')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              About Project →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
