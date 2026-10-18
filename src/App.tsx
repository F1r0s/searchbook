import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LibraryView } from './components/LibraryView';
import { VocabularyView } from './components/VocabularyView';
import StatsView from './components/StatsView';
import { AddBookModal } from './components/AddBookModal';
import { LandingView } from './components/LandingView';
import { LibraryStore } from './services/library-store';
import { Book, VocabularyWord } from './types';
import { PseoManagerModal } from './components/PseoManagerModal';
import { BatchScraperModal } from './components/BatchScraperModal';
import { useI18n } from './lib/i18n';
import { AuthService } from './services/auth-adapter';
import { SecretAdminView } from './components/SecretAdminView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { FeaturesView } from './components/FeaturesView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSecretAdminView, setIsSecretAdminView] = useState(false);
  const [isSecretAuthModalOpen, setIsSecretAuthModalOpen] = useState(false);
  const [initialBookSlug, setInitialBookSlug] = useState<string | null>(null);
  const [isPseoModalOpen, setIsPseoModalOpen] = useState(false);
  const [isBatchScraperOpen, setIsBatchScraperOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
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

    // Check URL hash or path for direct slug switching or secret admin route
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim();
      const path = typeof window !== 'undefined' ? window.location.pathname : '';

      // Check if accessed via hidden secret admin route: /secretadmin2026 or #secretadmin2026
      const isSecretRoute = AuthService.isSecretRoute(rawHash) || AuthService.isSecretRoute(path);
      if (isSecretRoute) {
        if (AuthService.isAuthenticated()) {
          setIsAdmin(true);
          setIsSecretAdminView(true);
        } else {
          setIsSecretAuthModalOpen(true);
        }
        setInitialBookSlug(null);
        return;
      }

      setIsSecretAdminView(false);

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
        // Any other slug is treated as a direct book slug (e.g. #1984, #sapiens, #deep-work)
        setActiveTab('library');
        setInitialBookSlug(rawHash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => {
    setActiveTab(tab);
    setInitialBookSlug(null);
    if (tab === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on About/Story page, render the presentation view
  if (activeTab === 'home') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LandingView onOpenAdmin={() => handleSelectTab('library')} />
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
        onAddBook={() => setIsAddBookOpen(true)}
        onOpenPseo={() => setIsPseoModalOpen(true)}
        onOpenBatchScrape={() => setIsBatchScraperOpen(true)}
        isAdmin={isAdmin}
        onExitAdmin={() => {
          setIsAdmin(false);
          window.location.hash = '';
        }}
      />

      {/* Main Public Library Container or Secret Admin View */}
      <main className="page" style={{ flex: 1, width: '100%' }}>
        {isSecretAdminView && isAdmin ? (
          <SecretAdminView
            books={books}
            onBookUpdated={refreshLibraryData}
            onOpenAddModal={() => setIsAddBookOpen(true)}
            onOpenBatchScraper={() => setIsBatchScraperOpen(true)}
            onOpenPseo={() => setIsPseoModalOpen(true)}
            onExitAdmin={() => {
              setIsSecretAdminView(false);
              window.location.hash = '';
            }}
          />
     ) : activeTab === 'library' ? (
          <LibraryView
            books={books}
            onBookUpdated={refreshLibraryData}
            onOpenAddModal={() => setIsAddBookOpen(true)}
            isAdmin={isAdmin}
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
            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsSecretAdminView(!isSecretAdminView)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {isSecretAdminView ? 'View Shelf' : 'Admin Cockpit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AuthService.logout();
                    setIsAdmin(false);
                    setIsSecretAdminView(false);
                    window.location.hash = '';
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  Exit Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Add Book Modal (Active in Admin Mode or when triggered) */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onBookAdded={refreshLibraryData}
      />

      {/* pSEO Engine Modal */}
      <PseoManagerModal
        isOpen={isPseoModalOpen}
        books={books}
        onClose={() => setIsPseoModalOpen(false)}
      />

      {/* Batch Book Scraper & Ingestion Modal */}
      <BatchScraperModal
        isOpen={isBatchScraperOpen}
        onClose={() => setIsBatchScraperOpen(false)}
        onBooksIngested={refreshLibraryData}
      />

      {/* Secret Route Master Login Gate */}
      <AdminLoginModal
        isOpen={isSecretAuthModalOpen}
        onLogin={async (pw) => {
          const ok = await AuthService.login(pw);
          if (ok) {
            setIsAdmin(true);
            setIsSecretAdminView(true);
            setIsSecretAuthModalOpen(false);
          }
          return ok;
        }}
        onClose={() => {
          setIsSecretAuthModalOpen(false);
          if (!AuthService.isAuthenticated()) {
            window.location.hash = '';
          }
        }}
      />
    </div>
  );
}
