import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import BookCover from './BookCover';
import { LibraryStore } from '../services/library-store';
import { useI18n } from '../lib/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onBookUpdated?: () => void;
}

export const BookPreviewReaderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  book,
  onBookUpdated,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'embed' | 'overview'>('embed');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lock background scrolling while reader is active
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve embedded reader URL for Internet Archive, Google Books, or Open Library
  const getEmbedUrl = (): string | null => {
    const rawUrl = book.readOnlineUrl || book.previewUrl;
    if (!rawUrl) return null;

    // Internet archive item ID extraction
    const iaMatch = rawUrl.match(/archive\.org\/(?:details|stream)\/([^/?#]+)/i);
    if (iaMatch && iaMatch[1]) {
      return `https://archive.org/stream/${iaMatch[1]}?ui=embed#mode/2up`;
    }

    // Google Books preview link embed mode
    if (rawUrl.includes('books.google.')) {
      return rawUrl.includes('output=embed') ? rawUrl : `${rawUrl}&output=embed`;
    }

    return rawUrl;
  };

  const embedUrl = getEmbedUrl();

  const handleDownload = (format: 'pdf' | 'epub', url?: string) => {
    LibraryStore.recordDownload(book.id, format);
    if (onBookUpdated) onBookUpdated();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        zIndex: 10000,
        background: 'rgba(17, 17, 17, 0.78)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isFullscreen ? '100vw' : 'min(1100px, 95vw)',
          height: isFullscreen ? '100vh' : 'min(880px, 92vh)',
          background: '#ffffff',
          border: isFullscreen ? 'none' : '3px solid var(--ink)',
          boxShadow: isFullscreen ? 'none' : 'var(--hard-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Reader Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '3px solid var(--ink)',
            background: 'var(--paper)',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                padding: '2px 6px',
                border: '1px solid var(--ink)',
                letterSpacing: '0.06em',
              }}
            >
              READER PREVIEW
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '15px',
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {book.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                by {book.author} · {book.pages ? `${book.pages} pages` : 'Volume'}
              </div>
            </div>
          </div>

          {/* Reader Toolset & Formats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* View Tab Switcher if embed available */}
            {embedUrl && (
              <div style={{ display: 'inline-flex', border: '1.5px solid var(--ink)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('embed')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: 'none',
                    background: activeTab === 'embed' ? 'var(--ink)' : '#fff',
                    color: activeTab === 'embed' ? '#fff' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  📖 Digital Scan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: 'none',
                    borderLeft: '1px solid var(--ink)',
                    background: activeTab === 'overview' ? 'var(--ink)' : '#fff',
                    color: activeTab === 'overview' ? '#fff' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  📝 Synopsis &amp; Notes
                </button>
              </div>
            )}

            {book.downloadPdfUrl && (
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => handleDownload('pdf', book.downloadPdfUrl)}
                style={{ fontSize: '11px', padding: '3px 8px', fontWeight: 800 }}
                title="Download complete PDF document"
              >
                ⬇ PDF
              </button>
            )}

            {book.downloadEpubUrl && (
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => handleDownload('epub', book.downloadEpubUrl)}
                style={{ fontSize: '11px', padding: '3px 8px', fontWeight: 800, background: '#1a34d6', color: '#fff' }}
                title="Download EPUB e-reader edition"
              >
                ⬇ EPUB
              </button>
            )}

            <button
              type="button"
              className="btn btn--sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                border: '2px solid var(--ink)',
                background: '#fff',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '14px',
              }}
              title="Close Reader"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Reader Canvas / Embedded Viewer */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'var(--paper-deep)' }}>
          {embedUrl && activeTab === 'embed' ? (
            <iframe
              src={embedUrl}
              title={`Digital scan of ${book.title}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#ffffff',
              }}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                padding: '32px 28px',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            >
              <div style={{ maxWidth: '780px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <BookCover book={book} size="md" />
                  </div>
                  <div>
                    <span className="sec-kicker" style={{ fontSize: '10px', color: 'var(--accent)' }}>
                      BIBLIOGRAPHIC RECORD
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: '4px 0 6px', lineHeight: 1.1 }}>
                      {book.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: 0, fontWeight: 600 }}>
                      by {book.author} ({book.year}) · {book.genre} · {book.pages} pages
                    </p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                      {book.readOnlineUrl && (
                        <a
                          href={book.readOnlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--primary btn--sm"
                          style={{ fontSize: '11px', textDecoration: 'none' }}
                        >
                          Open In Internet Archive ↗
                        </a>
                      )}
                      {book.previewUrl && (
                        <a
                          href={book.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--sm"
                          style={{ fontSize: '11px', textDecoration: 'none' }}
                        >
                          Open Online Catalogue ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px solid var(--ink)', paddingTop: '18px', marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>
                    Synopsis &amp; Volume Overview
                  </h4>
                  <p style={{ fontSize: '15px', lineHeight: 1.75, color: 'var(--ink)' }}>
                    {book.synopsis || `An essential work of ${book.genre} authored by ${book.author}.`}
                  </p>
                </div>

                {book.review && (
                  <blockquote
                    style={{
                      borderLeft: '4px solid var(--accent)',
                      padding: '10px 16px',
                      background: 'var(--paper-deep)',
                      margin: '18px 0',
                      fontStyle: 'italic',
                      fontSize: '14.5px',
                      lineHeight: 1.6,
                    }}
                  >
                    "{book.review}"
                  </blockquote>
                )}

                {book.notes && (
                  <div style={{ borderTop: '1px solid var(--hair)', paddingTop: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '6px' }}>
                      Reader Annotations
                    </h4>
                    <div
                      style={{ fontSize: '14px', lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: book.notes }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};