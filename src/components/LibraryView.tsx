import React, { useState } from 'react';
import { Library, FileText, BookOpen, Globe, Bookmark } from 'lucide-react';
import { Book, ReadingStatus } from '../types';
import CoverGrid from './CoverGrid';
import ListView from './ListView';
import BookDetailModal from './BookDetailModal';
import { LibraryStore } from '../services/library-store';
import { useI18n } from '../lib/i18n';
import { CpaLockerModal } from './CpaLockerModal';
import { LockerService } from '../services/locker-service';

interface Props {
  books: Book[];
  onBookUpdated: () => void;
  initialBookSlug?: string | null;
  initialSearchQuery?: string;
}

export const LibraryView: React.FC<Props> = ({
  books,
  onBookUpdated,
  initialBookSlug = null,
  initialSearchQuery = '',
}) => {
  const { t, locale } = useI18n();
  const [view, setView] = useState<'covers' | 'list'>('covers');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'epub' | 'open_scan' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  const [showNotesOnly, setShowNotesOnly] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // CPA Locker for Direct Downloads
  const [downloadLockerBook, setDownloadLockerBook] = useState<{ book: Book; format: 'pdf' | 'epub' } | null>(null);

  const handleDownloadWithLocker = (b: Book, fmt: 'pdf' | 'epub') => {
    if (LockerService.isUnlocked(b.id)) {
      triggerDownload(b, fmt);
    } else {
      setDownloadLockerBook({ book: b, format: fmt });
    }
  };

  const triggerDownload = (b: Book, fmt: 'pdf' | 'epub') => {
    LibraryStore.recordDownload(b.id, fmt);
    onBookUpdated();
    const url = fmt === 'pdf' ? (b.downloadPdfUrl || b.downloadUrl) : (b.downloadEpubUrl || b.downloadUrl);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else handleSelectBook(b.id);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, formatFilter, showNotesOnly]);

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
      const langPrefix = `/${locale || 'en'}`;
      window.history.pushState(null, '', `${langPrefix}/books/${book.slug}`);
    }
  };

  const handleCloseDetail = () => {
    setSelectedBookId(null);
    const langPrefix = `/${locale || 'en'}`;
    window.history.pushState(null, '', `${langPrefix}/library`);
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

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBooks = filteredBooks.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    const page = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Clean Institutional Header: Semantic Icon + Primary H1 Title + Concise 1-Line Subtitle */}
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <Library size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            Digital Library &amp; Archives
          </h1>
        </div>
        <p className="masthead-stats">
          {books.length.toLocaleString()} {books.length === 1 ? 'volume' : 'volumes'} indexed ·{' '}
          {books.filter((b) => b.downloadPdfUrl).length.toLocaleString()} PDF documents ·{' '}
          {books.filter((b) => b.downloadEpubUrl).length.toLocaleString()} EPUB editions ·{' '}
          {books.filter((b) => b.readOnlineUrl || b.isPublicDomain).length.toLocaleString()} open scans
        </p>
      </header>

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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={13} /> PDF Documents ({books.filter((b) => b.downloadPdfUrl).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'epub' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('epub')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={13} /> EPUB Editions ({books.filter((b) => b.downloadEpubUrl).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'open_scan' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('open_scan')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={13} /> Public Scans ({books.filter((b) => b.readOnlineUrl || b.isPublicDomain).length})
          </button>
          <button
            type="button"
            className={formatFilter === 'favorites' ? 'chip chip--active' : 'chip'}
            onClick={() => setFormatFilter('favorites')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: formatFilter === 'favorites' ? 'var(--accent)' : 'var(--ink)',
              background: formatFilter === 'favorites' ? 'var(--accent)' : '#fff',
              color: formatFilter === 'favorites' ? '#fff' : 'var(--ink)',
            }}
          >
            <Bookmark size={13} /> {t('toolbar.favorites')} ({books.filter((b) => b.isFavorite).length})
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
          books={paginatedBooks}
          onSelect={handleSelectBook}
          onToggleFavorite={(id) => {
            LibraryStore.toggleFavorite(id);
            onBookUpdated();
          }}
          onDownload={handleDownloadWithLocker}
        />
      ) : (
        <ListView
          books={paginatedBooks}
          onSelect={handleSelectBook}
          onDownload={handleDownloadWithLocker}
        />
      )}

      {/* Pagination Controls */}
      {filteredBooks.length > 0 && (
        <div
          style={{
            marginTop: '32px',
            paddingTop: '18px',
            borderTop: '2px solid var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)' }}>
            Showing <strong>{Math.min(filteredBooks.length, (validCurrentPage - 1) * pageSize + 1)}</strong>–
            <strong>{Math.min(filteredBooks.length, validCurrentPage * pageSize)}</strong> of{' '}
            <strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'volume' : 'volumes'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--sm"
              disabled={validCurrentPage <= 1}
              onClick={() => handlePageChange(validCurrentPage - 1)}
              style={{
                opacity: validCurrentPage <= 1 ? 0.45 : 1,
                cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Previous
            </button>

            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '12.5px',
                padding: '4px 10px',
                border: '1.5px solid var(--ink)',
                background: '#ffffff',
              }}
            >
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn--sm"
              disabled={validCurrentPage >= totalPages}
              onClick={() => handlePageChange(validCurrentPage + 1)}
              style={{
                opacity: validCurrentPage >= totalPages ? 0.45 : 1,
                cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1.5px solid var(--ink)',
                background: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              aria-label="Volumes per page"
            >
              <option value={12}>12 / page</option>
              <option value={18}>18 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={handleCloseDetail}
          onBookUpdated={onBookUpdated}
        />
      )}

      {/* Direct Download CPA Locker Modal */}
      {downloadLockerBook && (
        <CpaLockerModal
          isOpen={Boolean(downloadLockerBook)}
          onClose={() => setDownloadLockerBook(null)}
          onUnlocked={() => {
            if (downloadLockerBook) {
              triggerDownload(downloadLockerBook.book, downloadLockerBook.format);
              setDownloadLockerBook(null);
            }
          }}
          bookId={downloadLockerBook.book.id}
          bookTitle={downloadLockerBook.book.title}
          targetActionName={`Digital ${downloadLockerBook.format.toUpperCase()} Download`}
          requiredOffers={2}
        />
      )}
    </div>
  );
};
