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
  const { t } = useI18n();

  // Library state
  const [books, setBooks] = useState<Book[]>([]);
  const [vocab, setVocab] = useState<VocabularyWord[]>([]);

  const refreshLibraryData = () => {
    setBooks(LibraryStore.getBooks());
    setVocab(LibraryStore.getVocabulary());
  };

  useEffect(() => {
    refreshLibraryData();

    // Check URL path and hash for direct slug switching or search landing pages
    const handleLocationChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      const path = typeof window !== 'undefined' ? window.location.pathname : '';

      // Check for clean pSEO book route: /books/:slug or /:lang/books/:slug
      const pathMatch = path.match(/(?:\/(?:en|es|fr|pt))?\/books\/([^/?#]+)/i);
      const isKnownTab = ['home', 'library', 'vocab', 'stats', 'about', 'contact', 'features'].includes(rawHash);
      const targetSlug = pathMatch ? pathMatch[1] : (!isKnownTab && rawHash ? rawHash : null);

      if (targetSlug) {
        const allBooks = LibraryStore.getBooks();
        const found = allBooks.find((b) => b.slug === targetSlug || b.id === targetSlug);
        if (found) {
          setPseoBook(found);
          setInitialBookSlug(null);
          return;
        }
      }

      setPseoBook(null);

      if (!rawHash || rawHash === 'home') {
        setActiveTab('home');
        setInitialBookSlug(null);
        document.title = 'Searchbook – The Open Digital Library';
        return;
      }

      if (rawHash === 'vocab') {
        setActiveTab('vocab');
        setInitialBookSlug(null);
        document.title = 'Vocabulary Registry – Searchbook';
      } else if (rawHash === 'stats') {
        setActiveTab('stats');
        setInitialBookSlug(null);
        document.title = 'Reading Statistics – Searchbook';
      } else if (rawHash === 'about') {
        setActiveTab('about');
        setInitialBookSlug(null);
        document.title = 'About – Searchbook Digital Library';
      } else if (rawHash === 'contact') {
        setActiveTab('contact');
        setInitialBookSlug(null);
        document.title = 'Contact – Searchbook Digital Library';
      } else if (rawHash === 'features') {
        setActiveTab('features');
        setInitialBookSlug(null);
        document.title = 'Features – Searchbook Digital Library';
      } else if (rawHash === 'library') {
        setActiveTab('library');
        setInitialBookSlug(null);
        document.title = 'Digital Library & Archives – Searchbook';
      } else {
        setActiveTab('library');
        setInitialBookSlug(rawHash);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleSelectTab = (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => {
    setPseoBook(null);
    setActiveTab(tab);
    setInitialBookSlug(null);
    if (typeof window !== 'undefined' && window.location.pathname.includes('/books/')) {
      window.history.pushState(null, '', `/#${tab}`);
    } else {
      window.location.hash = tab === 'home' ? '' : tab;
    }
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
