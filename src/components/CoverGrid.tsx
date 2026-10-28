import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';
import BookCover from './BookCover';
import StarRating from './StarRating';

interface Props {
  books: Book[];
  onSelect: (id: string) => void;
  onDownload?: (book: Book, format: 'pdf' | 'epub') => void;
  onToggleFavorite?: (id: string) => void;
}

export default function CoverGrid({ books, onSelect, onDownload, onToggleFavorite }: Props) {
  if (books.length === 0) {
    return <p className="empty-note">No records found.</p>;
  }

  const renderCaption = (book: Book) => (
    <div style={{ textAlign: 'center', width: '100%', marginTop: '6px', padding: '0 4px' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '13.5px',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={book.title}
      >
        {book.title}
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-soft)',
          marginTop: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {book.author}
      </div>
    </div>
  );

  return (
    <motion.ul
      className="cover-grid"
      layout
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.04 },
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {books.map((book) => {
          const hasPdf = Boolean(book.downloadPdfUrl);
          const hasEpub = Boolean(book.downloadEpubUrl);

          return (
            <motion.li
              key={book.id}
              layout
              variants={{
                hidden: { opacity: 0, scale: 0.94 },
                visible: { opacity: 1, scale: 1 },
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                className="cover-card"
                onClick={() => onSelect(book.id)}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <span className="cover-wrap">
                  <BookCover book={book} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFavorite) onToggleFavorite(book.id);
                    }}
                    className={`note-ribbon ${book.isFavorite ? 'note-ribbon--active' : 'note-ribbon--inactive'}`}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid var(--ink)',
                      borderTop: 'none',
                      pointerEvents: 'auto',
                      background: book.isFavorite ? 'var(--accent)' : '#fff',
                      opacity: book.isFavorite ? 1 : 0.45,
                      transform: book.isFavorite ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={book.isFavorite ? 'Bookmarked in Favorites' : 'Click to add to Favorites'}
                    aria-label={book.isFavorite ? 'Bookmarked' : 'Add to Favorites'}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        color: book.isFavorite ? '#fff' : 'var(--ink)',
                        display: 'block',
                        paddingBottom: '8px',
                        fontWeight: 900,
                      }}
                    >
                      ★
                    </span>
                  </button>
                  {(hasPdf || hasEpub) && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '3px',
                        zIndex: 3,
                      }}
                    >
                      {hasPdf && (
                        <span
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            fontSize: '8px',
                            fontWeight: 800,
                            padding: '1px 4px',
                            border: '1px solid var(--ink)',
                          }}
                        >
                          PDF
                        </span>
                      )}
                      {hasEpub && (
                        <span
                          style={{
                            background: '#1a34d6',
                            color: '#fff',
                            fontSize: '8px',
                            fontWeight: 800,
                            padding: '1px 4px',
                            border: '1px solid var(--ink)',
                          }}
                        >
                          EPUB
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="cover-caption">
                  {renderCaption(book)}
                </span>
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}
