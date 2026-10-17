import React, { useState } from 'react';
import { Book } from '../types';
import { LibraryStore } from '../services/library-store';
import BookCover from './BookCover';

interface Props {
  book: Book | null;
  onClose: () => void;
  onBookUpdated?: () => void;
}

export const DownloadModal: React.FC<Props> = ({
  book,
  onClose,
  onBookUpdated,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!book) return null;

  const handleDownload = (format: 'pdf' | 'epub', url?: string) => {
    LibraryStore.recordDownload(book.id, format);
    if (onBookUpdated) onBookUpdated();

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setDownloadSuccess(`Started ${format.toUpperCase()} download!`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }
  };

  const hasPdf = Boolean(book.downloadPdfUrl);
  const hasEpub = Boolean(book.downloadEpubUrl);
  const hasScan = Boolean(book.readOnlineUrl || book.isPublicDomain);

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '30px' }}
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close download prompt"
        >
          ✕
        </button>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', borderBottom: '3px solid var(--ink)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ width: '80px', flexShrink: 0 }}>
            <BookCover book={book} size="sm" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="sec-kicker" style={{ fontSize: '10px', color: 'var(--accent)' }}>
              DIGITAL REPOSITORY
            </span>
            <h2 className="detail-title" style={{ fontSize: '24px', margin: '4px 0 6px', lineHeight: 1.1 }}>
              {book.title}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600 }}>
              by {book.author} ({book.year}) · {book.pages ? `${book.pages} pages` : 'Volume'}
            </p>
          </div>
        </div>

        {downloadSuccess && (
          <div
            style={{
              background: '#e8f5e9',
              border: '2px solid #2e7d32',
              color: '#1b5e20',
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ✓ {downloadSuccess}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Format 1: PDF Document */}
          <div
            style={{
              border: '2px solid var(--ink)',
              padding: '14px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--hard)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '10px', padding: '2px 6px', border: '1px solid var(--ink)' }}>
                  PDF
                </span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Adobe PDF Document</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>
                Universal document file. Formatted for laptops, tablets, and printing.
                {book.fileSize && <strong> · Size: {book.fileSize}</strong>}
              </p>
            </div>

            {hasPdf ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleDownload('pdf', book.downloadPdfUrl)}
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                ⬇ Download PDF
              </button>
            ) : (
              <a
                href={`https://archive.org/search.php?query=${encodeURIComponent(book.title + ' ' + book.author)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--sm"
                style={{ fontSize: '11px', textDecoration: 'none' }}
              >
                Find Mirror ↗
              </a>
            )}
          </div>

          {/* Format 2: EPUB E-Reader */}
          <div
            style={{
              border: '2px solid var(--ink)',
              padding: '14px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--hard)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#1a34d6', color: '#fff', fontWeight: 800, fontSize: '10px', padding: '2px 6px', border: '1px solid var(--ink)' }}>
                  EPUB
                </span>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>EPUB E-Reader Edition</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>
                Reflowable digital format for Kindle, Apple Books, Kobo, and mobile readers.
              </p>
            </div>

            {hasEpub ? (
              <button
                type="button"
                className="btn"
                onClick={() => handleDownload('epub', book.downloadEpubUrl)}
                style={{ background: '#1a34d6', color: '#fff', fontSize: '12px', padding: '8px 14px' }}
              >
                ⬇ Download EPUB
              </button>
            ) : (
              <a
                href={`https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--sm"
                style={{ fontSize: '11px', textDecoration: 'none' }}
              >
                Search Open Library ↗
              </a>
            )}
          </div>

          {/* Format 3: Direct Web Reader */}
          {hasScan && (
            <div
              style={{
                border: '2px solid var(--ink)',
                padding: '14px',
                background: 'var(--paper-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>📖 In-Browser Reader (Open Scan)</span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>
                  Read page-by-page directly in your browser without downloading.
                </p>
              </div>

              <a
                href={book.readOnlineUrl || book.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--accent btn--sm"
                style={{ fontSize: '12px', textDecoration: 'none' }}
              >
                Open Reader ↗
              </a>
            </div>
          )}
        </div>

        <div style={{ marginTop: '22px', borderTop: '2px solid var(--line)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};