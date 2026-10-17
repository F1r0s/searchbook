import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';
import { paletteFor } from '../lib/palette';
import StarRating from './StarRating';

interface Props {
  books: Book[];
  onSelect: (id: string) => void;
  onDownload?: (book: Book, format: 'pdf' | 'epub') => void;
}

export const AnimatedDownloadTable: React.FC<Props> = ({
  books,
  onSelect,
  onDownload,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadClick = (
    e: React.MouseEvent,
    book: Book,
    format: 'pdf' | 'epub'
  ) => {
    e.stopPropagation();
    setDownloadingId(`${book.id}-${format}`);
    setTimeout(() => setDownloadingId(null), 1200);

    if (onDownload) {
      onDownload(book, format);
    } else {
      const url = format === 'pdf' ? book.downloadPdfUrl : book.downloadEpubUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        onSelect(book.id);
      }
    }
  };

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);

  return (
    <div className="ledger-wrap" style={{ border: '3px solid var(--ink)', boxShadow: 'var(--hard)' }}>
      <table className="ledger">
        <thead>
          <tr>
            <th style={{ width: '38%' }}>Title &amp; Volume</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Digital Formats</th>
            <th>Pages &amp; Size</th>
            <th style={{ textAlign: 'right' }}>Direct Download</th>
          </tr>
        </thead>
        <motion.tbody layout>
          <AnimatePresence mode="popLayout">
            {books.map((book, index) => {
              const colorIndex =
                typeof book.colorIndex === 'number'
                  ? book.colorIndex
                  : Math.abs(
                      book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                    );
              const spineBg = book.coverColor || paletteFor(colorIndex).bg;

              const hasPdf = Boolean(book.downloadPdfUrl);
              const hasEpub = Boolean(book.downloadEpubUrl);
              const hasScan = Boolean(book.readOnlineUrl || book.isPublicDomain);

              return (
                <motion.tr
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.3) }}
                  onClick={() => onSelect(book.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="ledger-title" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="ledger-swatch" style={{ background: spineBg, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: '14.5px', display: 'inline-block' }}>
                          {book.title}
                        </span>
                        {book.rating > 0 && (
                          <span style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                            <StarRating value={book.rating} size="sm" />
                          </span>
                        )}
                        {book.synopsis && (
                          <div style={{ fontSize: '11px', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                            {book.synopsis}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize: '13.5px', fontWeight: 600 }}>{book.author}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>{book.genre ?? 'General'}</td>

                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {hasPdf && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            border: '1.5px solid var(--ink)',
                            padding: '1px 5px',
                            background: '#ff3b1f',
                            color: '#fff',
                            letterSpacing: '0.04em',
                          }}
                        >
                          PDF
                        </span>
                      )}
                      {hasEpub && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            border: '1.5px solid var(--ink)',
                            padding: '1px 5px',
                            background: '#1a34d6',
                            color: '#fff',
                            letterSpacing: '0.04em',
                          }}
                        >
                          EPUB
                        </span>
                      )}
                      {hasScan && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            border: '1.5px solid var(--ink)',
                            padding: '1px 5px',
                            background: '#ffd400',
                            color: '#111',
                            letterSpacing: '0.04em',
                          }}
                        >
                          OPEN SCAN
                        </span>
                      )}
                      {!hasPdf && !hasEpub && !hasScan && (
                        <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Catalogue</span>
                      )}
                    </div>
                  </td>

                  <td style={{ fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 700 }}>{book.pages ? `${book.pages} pp` : '—'}</span>
                    {book.fileSize && (
                      <span style={{ color: 'var(--ink-soft)', marginLeft: '6px', fontSize: '11px' }}>
                        · {book.fileSize}
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {hasPdf && (
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={(e) => handleDownloadClick(e, book, 'pdf')}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            fontWeight: 800,
                            background: downloadingId === `${book.id}-pdf` ? 'var(--accent)' : '#fff',
                            color: downloadingId === `${book.id}-pdf` ? '#fff' : 'var(--ink)',
                          }}
                          title="Download PDF document"
                        >
                          {downloadingId === `${book.id}-pdf` ? '✓ Got PDF' : '⬇ PDF'}
                        </button>
                      )}

                      {hasEpub && (
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={(e) => handleDownloadClick(e, book, 'epub')}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            fontWeight: 800,
                            background: downloadingId === `${book.id}-epub` ? 'var(--ink)' : '#fff',
                            color: downloadingId === `${book.id}-epub` ? '#fff' : 'var(--ink)',
                          }}
                          title="Download EPUB e-reader file"
                        >
                          {downloadingId === `${book.id}-epub` ? '✓ Got EPUB' : '⬇ EPUB'}
                        </button>
                      )}

                      {!hasPdf && !hasEpub && (
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(book.id);
                          }}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Inspect →
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </motion.tbody>
        <tfoot>
          <tr>
            <td colSpan={6} style={{ borderTop: '3px solid var(--ink)', padding: '12px 14px' }}>
              <strong>{books.length}</strong> {books.length === 1 ? 'volume' : 'volumes'} indexed in library ·{' '}
              <strong>{books.filter((b) => b.downloadPdfUrl).length}</strong> PDF documents ·{' '}
              <strong>{books.filter((b) => b.downloadEpubUrl).length}</strong> EPUB editions ·{' '}
              <strong>{totalDownloads.toLocaleString()}</strong> total reader downloads
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};