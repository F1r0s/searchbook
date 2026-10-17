import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import CoverGrid from './CoverGrid';
import ListView from './ListView';
import BookDetailModal from './BookDetailModal';
import { LibraryStore } from '../services/library-store';
import { useI18n } from '../lib/i18n';

interface Props {
  books: Book[];
  onBookUpdated: () => void;
  onOpenAddModal: () => void;
  isAdmin?: boolean;
  initialBookSlug?: string | null;
}

export const LibraryView: React.FC<Props> = ({
  books,
  onBookUpdated,
  onOpenAddModal,
  isAdmin = false,
  initialBookSlug = null,
}) => {
  const { t } = useI18n();
  const [view, setView] = useState<'covers' | 'list'>('covers');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'epub' | 'open_scan' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotesOnly, setShowNotesOnly] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Auto-open book if slug is in URL
  React.useEffect(() => {
    if (initialBookSlug) {
      const match = books.find(
        (b) =>
          b.slug === initialBookSlug ||
          b.id === initialBookSlug ||
          b.slug === initialBookSlug.replace(/^book-/, '')
      );
      if (match) {
        setSelectedBookId(match.id);
      }
    }
  }, [initialBookSlug, books]);

  const handleSelectBook = (id: string) => {
    setSelectedBookId(id);
    const book = books.find((b) => b.id === id);
    if (book) {
      window.location.hash = book.slug;
    }
  };

  const handleCloseDetail = () => {
    setSelectedBookId(null);
    if (
      window.location.hash &&
      !window.location.hash.includes('admin') &&
      !window.location.hash.includes('vocab') &&
      !window.location.hash.includes('stats')
    ) {
      window.location.hash = isAdmin ? 'admin' : '';
    }
  };

  // Filter books
  const filteredBooks = books.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (formatFilter === 'favorites' && !b.isFavorite) return false;
    if (formatFilter === 'pdf' && !b.downloadPdfUrl) return false;
    if (formatFilter === 'epub' && !b.downloadEpubUrl) return false;
    if (formatFilter === 'open_scan' && !b.readOnlineUrl && !b.isPublicDomain) return false;
    if (showNotesOnly && !b.notes && !b.review) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.notes && b.notes.toLowerCase().includes(q)) ||
        (b.review && b.review.toLowerCase().includes(q)) ||
        (b.genre && b.genre.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedBook = books.find((b) => b.id === selectedBookId) || null;

  const counts = {
    all: books.length,
    read: books.filter((b) => b.status === 'finished').length,
    reading: books.filter((b) => b.status === 'reading').length,
    toRead: books.filter((b) => b.status === 'want_to_read').length,
    dnf: books.filter((b) => b.status === 'dnf').length,
  };

  const handleExportBackup = () => {
    const json = LibraryStore.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booksearch-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = LibraryStore.exportMarkdownNotes();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booksearch-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (LibraryStore.importBackupJson(content)) {
        onBookUpdated();
        alert('Library backup successfully restored!');
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page" style={{ padding: '0' }}>
      {/* Exact Bookplate Masthead */}
      <div className="masthead">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span className="masthead-eyebrow">{t('masthead.ledgerEyebrow')}</span>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleExportBackup}
                className="btn btn--sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {t('masthead.exportJson')}
              </button>
              <button
                onClick={handleExportMarkdown}
                className="btn btn--sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {t('masthead.exportNotes')}
              </button>
              <label
                className="btn btn--sm"
                style={{ fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}
              >
                {t('masthead.import')}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>

        <h1 className="masthead-title">Digital Library &amp; Archives</h1>
        <p className="masthead-stats">
          {books.length} {books.length === 1 ? 'volume' : 'volumes'} indexed ·{' '}
          {books.filter((b) => b.downloadPdfUrl).length} PDF downloads ready ·{' '}
          {books.filter((b) => b.downloadEpubUrl).length} EPUB files ·{' '}
          {books.filter((b) => b.readOnlineUrl || b.isPublicDomain).length} open scans available
        </p>
      </div>

      {/* Exact Bookplate Toolbar */}
      <div className="toolbar" style={{ margin: '20px 0 28px' }}>
        <div className="toolbar-row">
          <input
            type="search"
            className="search"
            placeholder={t('toolbar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="view-toggle" role="tablist" aria-label="View">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'covers'}
              className={view === 'covers' ? 'view-btn view-btn--active' : 'view-btn'}
              onClick={() => setView('covers')}
            >
              {t('toolbar.covers')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'list'}
              className={view === 'list' ? 'view-btn view-btn--active' : 'view-btn'}
              onClick={() => setView('list')}
            >
              {t('toolbar.ledger')}
            </button>
          </div>
          {isAdmin && (
            <button type="button" className="btn btn--primary" onClick={onOpenAddModal}>
              {t('nav.addBook')}
            </button>
          )}
        </div>

        <div className="toolbar-row toolbar-row--chips">
          <button
            type="button"
            className={formatFilter === 'all' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('all')}
          >
            All Formats ({books.length})
          </button>
          <button
            type="button"
            className={formatFilter === 'pdf' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('pdf')}
          >
            📄 PDF Downloads ({books.filter((b) => b.downloadPdfUrl).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'epub' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('epub')}
          >
            📱 EPUB Reader ({books.filter((b) => b.downloadEpubUrl).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'open_scan' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('open_scan')}
          >
            🌐 Public Scans ({books.filter((b) => b.readOnlineUrl || b.isPublicDomain).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'favorites' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('favorites')}
            style={{
              borderColor: formatFilter === 'favorites' ? 'var(--accent)' : 'var(--ink)',
              background: formatFilter === 'favorites' ? 'var(--accent)' : '#fff',
              color: formatFilter === 'favorites' ? '#fff' : 'var(--ink)',
            }}
          >
            ★ {t('toolbar.favorites')} ({books.filter((b) => b.isFavorite).length})
          </button>

          <button
            type="button"
            className={showNotesOnly ? 'chip chip--notes chip--notes-active' : 'chip chip--notes'}
            aria-pressed={showNotesOnly}
            onClick={() => setShowNotesOnly(!showNotesOnly)}
            style={{ marginLeft: 'auto' }}
          >
            {t('toolbar.showNotes')}
          </button>
        </div>
      </div>

      {/* Main Content: Animated Covers vs Animated Ledger */}
      {view === 'covers' ? (
        <CoverGrid
          books={filteredBooks}
          onSelect={handleSelectBook}
          onToggleFavorite={(id) => {
            LibraryStore.toggleFavorite(id);
            onBookUpdated();
          }}
          onDownload={(b, fmt) => {
            LibraryStore.recordDownload(b.id, fmt);
            onBookUpdated();
            const url = fmt === 'pdf' ? b.downloadPdfUrl : b.downloadEpubUrl;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
            else handleSelectBook(b.id);
          }}
        />
      ) : (
        <ListView
          books={filteredBooks}
          onSelect={handleSelectBook}
          onDownload={(b, fmt) => {
            LibraryStore.recordDownload(b.id, fmt);
            onBookUpdated();
            const url = fmt === 'pdf' ? b.downloadPdfUrl : b.downloadEpubUrl;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
            else handleSelectBook(b.id);
          }}
        />
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={handleCloseDetail}
          onBookUpdated={onBookUpdated}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};
