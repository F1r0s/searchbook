import React, { useEffect, useState } from 'react';
import { BookOpen, FileDown } from 'lucide-react';
import { Book } from '../types';
import BookCover from './BookCover';
import StarRating from './StarRating';
import { BookPreviewReaderModal } from './BookPreviewReaderModal';
import { CpaLockerModal } from './CpaLockerModal';
import { LockerService } from '../services/locker-service';
import { LibraryStore } from '../services/library-store';
import { PseoService } from '../services/pseo-service';
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
  const { locale } = useI18n();
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'epub' | null>(null);

  const renderedMeta = PseoService.renderBookMeta(book, locale);

  // Dynamic SEO Header and JSON-LD Injection driven by Admin pSEO Templates
  useEffect(() => {
    const originalTitle = document.title;
    document.title = renderedMeta.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';
    if (metaDesc) {
      metaDesc.content = renderedMeta.metaDescription;
    }

    const scriptId = 'pseo-book-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = renderedMeta.schemaJsonLd;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = originalDesc;
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [book, renderedMeta]);

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
      {/* Breadcrumb Navigation */}
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
        </div>

        {/* Content & Download Column — Strictly Semantic Icon + Primary H1 Title + Concise 1-Line Subtitle */}
        <div className="detail-body" style={{ minWidth: 0 }}>
          <header style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <BookOpen size={30} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <h1
                itemProp="name"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4.5vw, 44px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                {renderedMeta.h1Heading}
              </h1>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--ink-soft)', fontWeight: 600, margin: 0 }}>
              {renderedMeta.subtitle}
            </p>
          </header>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <StarRating value={book.rating || 5} size="md" />
            <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontWeight: 600 }}>
              {(book.rating || 4.8).toFixed(1)} / 5.0 rating
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
              <FileDown size={15} /> Download PDF ({book.fileSize || '2.4 MB'})
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
              <FileDown size={15} /> Download EPUB Edition
            </button>

            {(book.readOnlineUrl || book.previewUrl) && (
              <button
                type="button"
                className="btn"
                onClick={() => setIsReaderOpen(true)}
                style={{ fontSize: '13px', fontWeight: 700, padding: '10px 16px' }}
              >
                <BookOpen size={15} /> Read Volume Online
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
              {book.synopsis || `Archival edition of ${book.title} authored by ${book.author}.`}
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
            Readbook Digital Library
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>
            Browse indexed literary classics, philosophy treatises, and behavioral science volumes.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={onNavigateLibrary}
          style={{ fontSize: '12px' }}
        >
          Browse Catalog →
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