import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import BookCover from './BookCover';
import StarRating from './StarRating';
import { BookPreviewReaderModal } from './BookPreviewReaderModal';
import { CpaLockerModal } from './CpaLockerModal';
import { LockerService } from '../services/locker-service';
import { LibraryStore } from '../services/library-store';
import { useI18n } from '../lib/i18n';

interface Props {
  book: Book;
  onNavigateLibrary: () => void;
  onNavigateHome: () => void;
}

export const PseoBookLandingView: React.FC<Props> = ({
  book,
  onNavigateLibrary,
  onNavigateHome,
}) => {
  const { t } = useI18n();
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'epub' | null>(null);

  // Dynamic SEO Header and JSON-LD Injection for Googlebot
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${book.title} by ${book.author} – Free PDF & EPUB Download | Searchbook`;

    // Meta description injection
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';
    const newDesc = `Download or read online ${book.title} by ${book.author}. ${book.pages ? `${book.pages} pages.` : ''} Free PDF, EPUB, and digital library editions with zero accounts required.`;
    if (metaDesc) {
      metaDesc.content = newDesc;
    }

    // Dynamic Schema.org Book JSON-LD injection
    const scriptId = 'pseo-book-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: {
        '@type': 'Person',
        name: book.author,
      },
      numberOfPages: book.pages || undefined,
      genre: book.genre || 'Literature',
      datePublished: book.year ? `${book.year}-01-01` : undefined,
      image: book.coverImage || undefined,
      description: book.synopsis || newDesc,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [book]);

  const handleDownload = (format: 'pdf' | 'epub') => {
    if (LockerService.isUnlocked(book.id)) {
      triggerDownload(format);
    } else {
      setPendingFormat(format);
      setIsLockerOpen(true);
    }
  };

  const triggerDownload = (format: 'pdf' | 'epub') => {
    LibraryStore.recordDownload(book.id, format);
    const url =
      format === 'pdf'
        ? (book.downloadPdfUrl || book.downloadUrl)
        : (book.downloadEpubUrl || book.downloadUrl);

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="page" itemScope itemType="https://schema.org/Book" style={{ padding: '0 0 60px' }}>
      {/* Breadcrumb Navigation for Search Crawlers & Visitors */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '20px', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
        <button
          type="button"
          onClick={onNavigateHome}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
        >
          Home
        </button>
        {' › '}
        <button
          type="button"
          onClick={onNavigateLibrary}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
        >
          Library
        </button>
        {' › '}
        <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{book.title}</span>
      </nav>

      {/* Main Book Presentation Card */}
      <div
        className="detail-layout"
        style={{
          background: '#ffffff',
          border: '3px solid var(--ink)',
          boxShadow: 'var(--hard-lg)',
          padding: '28px',
          marginBottom: '32px',
        }}
      >
        {/* Cover Column */}
        <div className="detail-cover" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ width: '100%', maxWidth: '220px', boxShadow: 'var(--hard)' }}>
            <BookCover book={book} size="lg" />
          </div>

          <div
            style={{
              background: 'var(--paper-deep)',
              border: '1.5px solid var(--ink)',
              padding: '8px 10px',
              fontSize: '11px',
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            ✓ Free Open Digital Edition
          </div>
        </div>

        {/* Content & Download Column */}
        <div className="detail-body" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                border: '1.5px solid var(--ink)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {book.genre || 'Literature'}
            </span>
            {book.isPublicDomain && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                Public Domain Scan
              </span>
            )}
          </div>

          <h1
            itemProp="name"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 6px',
            }}
          >
            {book.title}
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', fontWeight: 600, margin: '0 0 14px' }}>
            by <span itemProp="author">{book.author}</span> {book.year ? `(${book.year})` : ''} ·{' '}
            {book.pages ? `${book.pages} pages` : 'Complete Volume'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <StarRating value={book.rating || 5} size="md" />
            <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontWeight: 600 }}>
              ★ {(book.rating || 4.8).toFixed(1)} / 5.0 reader score
            </span>
          </div>

          {/* Action Trigger Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              borderTop: '2px solid var(--ink)',
              borderBottom: '2px solid var(--ink)',
              padding: '16px 0',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => handleDownload('pdf')}
              style={{ fontSize: '13px', fontWeight: 800, padding: '10px 18px' }}
            >
              ⬇ Download PDF ({book.fileSize || '2.4 MB'})
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => handleDownload('epub')}
              style={{
                fontSize: '13px',
                fontWeight: 800,
                padding: '10px 18px',
                background: '#1a34d6',
                color: '#ffffff',
                borderColor: 'var(--ink)',
              }}
            >
              ⬇ Download EPUB E-Reader
            </button>

            {(book.readOnlineUrl || book.previewUrl) && (
              <button
                type="button"
                className="btn"
                onClick={() => setIsReaderOpen(true)}
                style={{ fontSize: '13px', fontWeight: 700, padding: '10px 16px' }}
              >
                📖 Read Online Free ↗
              </button>
            )}
          </div>

          {/* Synopsis */}
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 900,
                margin: '0 0 8px',
              }}
            >
              Synopsis &amp; Volume Overview
            </h2>
            <p
              itemProp="description"
              style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'var(--ink)', margin: 0 }}
            >
              {book.synopsis || `A celebrated work of ${book.genre} authored by ${book.author}. Complete edition available for digital reading.`}
            </p>
          </div>

          {/* Editorial Notes / Takeaways */}
          {book.notes && (
            <div
              style={{
                background: 'var(--paper-deep)',
                border: '1.5px solid var(--ink)',
                padding: '14px 16px',
                fontSize: '13.5px',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
                Editorial Analysis &amp; Key Quotes
              </strong>
              <div dangerouslySetInnerHTML={{ __html: book.notes }} />
            </div>
          )}
        </div>
      </div>

      {/* Cross-Link Back to Main Digital Library */}
      <div
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--ink)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <strong style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
            Searchbook Digital Library
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>
            Browse hundreds of curated literary classics, philosophy treatises, and behavioral science books.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={onNavigateLibrary}
          style={{ fontSize: '12px' }}
        >
          Explore Full Library Shelf →
        </button>
      </div>

      {/* In-App Reader Modal */}
      <BookPreviewReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        book={book}
      />

      {/* CPA Locker for Direct Download Protection */}
      <CpaLockerModal
        isOpen={isLockerOpen}
        onClose={() => {
          setIsLockerOpen(false);
          setPendingFormat(null);
        }}
        onUnlocked={() => {
          setIsLockerOpen(false);
          if (pendingFormat) {
            triggerDownload(pendingFormat);
            setPendingFormat(null);
          }
        }}
        bookId={book.id}
        bookTitle={book.title}
        targetActionName={`Digital ${pendingFormat?.toUpperCase() || 'E-Book'} Download`}
        requiredOffers={2}
      />
    </article>
  );
};