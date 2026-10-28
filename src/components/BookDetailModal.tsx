import React, { useState, useEffect } from 'react';
import { Book, ReadingStatus } from '../types';
import BookCover from './BookCover';
import StarRating from './StarRating';
import { LibraryStore } from '../services/library-store';
import { PALETTE } from '../lib/palette';
import { BookScraper } from '../services/scraper';
import { RichNotesEditor } from './RichNotesEditor';
import { BookPreviewReaderModal } from './BookPreviewReaderModal';
import { CpaLockerModal } from './CpaLockerModal';
import { LockerService } from '../services/locker-service';

interface Props {
  book: Book;
  onClose: () => void;
  onBookUpdated: () => void;
  isAdmin?: boolean;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BookDetailModal({
  book,
  onClose,
  onBookUpdated,
  isAdmin = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [readerNotes, setReaderNotes] = useState(book.notes || '');
  const [notesSaveToast, setNotesSaveToast] = useState<string | null>(null);

  // In-app Reader & CPA Locker state
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isDownloadLockerOpen, setIsDownloadLockerOpen] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<'pdf' | 'epub' | null>(null);

  const handleDownloadRequest = (format: 'pdf' | 'epub') => {
    if (LockerService.isUnlocked(book.id)) {
      triggerDownload(format);
    } else {
      setPendingDownloadFormat(format);
      setIsDownloadLockerOpen(true);
    }
  };

  const triggerDownload = (format: 'pdf' | 'epub') => {
    LibraryStore.recordDownload(book.id, format);
    onBookUpdated();
    const fallbackUrl =
      book.readOnlineUrl ||
      book.previewUrl ||
      `https://archive.org/search.php?query=${encodeURIComponent(book.title + ' ' + book.author)}`;
    const url =
      format === 'pdf'
        ? (book.downloadPdfUrl || book.downloadUrl || fallbackUrl)
        : (book.downloadEpubUrl || book.downloadUrl || fallbackUrl);

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Edit form state
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [genre, setGenre] = useState(book.genre || '');
  const [pages, setPages] = useState(book.pages?.toString() || '0');
  const [currentPage, setCurrentPage] = useState(book.currentPage?.toString() || '0');
  const [status, setStatus] = useState<ReadingStatus>(book.status);
  const [rating, setRating] = useState(book.rating);
  const [startedDate, setStartedDate] = useState(book.startedDate || '');
  const [finishedDate, setFinishedDate] = useState(book.finishedDate || '');
  const [review, setReview] = useState(book.review || '');
  const [notes, setNotes] = useState(book.notes || '');
  const [coverImage, setCoverImage] = useState(book.coverImage || '');
  const [colorIndex, setColorIndex] = useState(book.colorIndex ?? 0);
  const [readOnlineUrl, setReadOnlineUrl] = useState(book.readOnlineUrl || '');
  const [previewUrl, setPreviewUrl] = useState(book.previewUrl || '');
  const [downloadUrl, setDownloadUrl] = useState(book.downloadUrl || '');
  const [isPublicDomain, setIsPublicDomain] = useState(book.isPublicDomain ?? false);
  const [openSourceProvider, setOpenSourceProvider] = useState(book.openSourceProvider || '');
  const [isFindingEbook, setIsFindingEbook] = useState(false);

  // Cover picker state
  const [olQuery, setOlQuery] = useState(book.title);
  const [olResults, setOlResults] = useState<Array<{ title: string; author: string; coverUrl?: string; pages?: number }>>([]);
  const [isSearchingOl, setIsSearchingOl] = useState(false);

  // Quick progress update
  const [quickPage, setQuickPage] = useState(book.currentPage?.toString() || '0');

  const getStatusLabel = (s: ReadingStatus) => {
    switch (s) {
      case 'finished':
        return 'READ';
      case 'reading':
        return 'READING';
      case 'want_to_read':
        return 'TBR';
      case 'dnf':
        return "DIDN'T FINISH";
      default:
        return s;
    }
  };

  const handleStatusChange = (newStatus: ReadingStatus) => {
    const today = new Date().toISOString().split('T')[0];
    LibraryStore.updateBook(book.id, {
      status: newStatus,
      finishedDate: newStatus === 'finished' ? (book.finishedDate || today) : book.finishedDate,
      startedDate: (newStatus === 'reading' || newStatus === 'finished') && !book.startedDate ? today : book.startedDate,
    });
    onBookUpdated();
  };

  const handleRatingChange = (newRating: number) => {
    LibraryStore.updateBook(book.id, { rating: newRating });
    onBookUpdated();
  };

  const handleQuickProgressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Math.max(0, parseInt(quickPage, 10) || 0);
    const updates: Partial<Book> = { currentPage: p };
    if (book.pages && p >= book.pages) {
      updates.status = 'finished';
      updates.finishedDate = new Date().toISOString().split('T')[0];
    }
    LibraryStore.updateBook(book.id, updates);
    onBookUpdated();
  };

  const handleFinishBook = () => {
    const today = new Date().toISOString().split('T')[0];
    LibraryStore.updateBook(book.id, {
      status: 'finished',
      currentPage: book.pages,
      finishedDate: today,
    });
    onBookUpdated();
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    LibraryStore.updateBook(book.id, {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      pages: parseInt(pages, 10) || 0,
      currentPage: parseInt(currentPage, 10) || 0,
      status,
      rating,
      startedDate: startedDate || undefined,
      finishedDate: finishedDate || undefined,
      review: review.trim(),
      notes: notes.trim(),
      coverImage: coverImage.trim() || undefined,
      colorIndex,
      coverColor: PALETTE[colorIndex]?.bg,
      readOnlineUrl: readOnlineUrl.trim() || undefined,
      previewUrl: previewUrl.trim() || undefined,
      downloadUrl: downloadUrl.trim() || undefined,
      isPublicDomain,
      openSourceProvider: openSourceProvider.trim() || undefined,
    });
    setIsEditing(false);
    setShowCoverPicker(false);
    onBookUpdated();
  };

  const handleAutoFindEbook = async () => {
    setIsFindingEbook(true);
    try {
      const res = await BookScraper.resolveOpenSourceBookLinks(book.title, book.author);
      if (res && (res.readOnlineUrl || res.previewUrl || res.downloadUrl)) {
        LibraryStore.updateBook(book.id, {
          readOnlineUrl: res.readOnlineUrl,
          previewUrl: res.previewUrl,
          downloadUrl: res.downloadUrl,
          isPublicDomain: res.isPublicDomain,
          openSourceProvider: res.openSourceProvider,
        });
        setReadOnlineUrl(res.readOnlineUrl || '');
        setPreviewUrl(res.previewUrl || '');
        setDownloadUrl(res.downloadUrl || '');
        setIsPublicDomain(Boolean(res.isPublicDomain));
        setOpenSourceProvider(res.openSourceProvider || '');
        onBookUpdated();
      } else {
        alert(`No direct open digital scan found for "${book.title}". You can use the Google Books or Open Library search links.`);
      }
    } catch {
      alert('Error searching open archives.');
    } finally {
      setIsFindingEbook(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${book.title}" from your personal library?`)) {
      LibraryStore.deleteBook(book.id);
      onBookUpdated();
      onClose();
    }
  };

  const searchOpenLibrary = async (q: string) => {
    if (!q.trim()) return;
    setIsSearchingOl(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        const results = (data.docs || []).map((doc: any) => ({
          title: doc.title || '',
          author: doc.author_name?.[0] || 'Unknown',
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
          pages: doc.number_of_pages_median,
        }));
        setOlResults(results);
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingOl(false);
    }
  };

  const readingPercent = book.pages && book.currentPage
    ? Math.min(100, Math.max(0, Math.round((book.currentPage / book.pages) * 100)))
    : 0;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog dialog--detail"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 'min(820px, 100vw)' }}
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close"
          title="Close dialog"
        >
          ✕
        </button>

        <div className="detail-layout">
            {/* Left Book Cover Column */}
            <div className="detail-cover" style={{ maxWidth: '210px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <BookCover book={book} size="lg" />
            </div>

            {/* Right Book Detail Body Column */}
            <div className="detail-body">
              <span className="detail-kicker">{getStatusLabel(book.status)}</span>
              <h2 className="detail-title" style={{ wordBreak: 'normal', overflowWrap: 'break-word', lineHeight: 1.15 }}>
                {book.title}
              </h2>
              <p className="detail-author">by {book.author}</p>

              <div className="detail-rating">
                <StarRating value={book.rating} onChange={handleRatingChange} size="lg" />
              </div>

              {/* Progress Panel for Currently Reading Books (admin-only interactive, public shows read-only bar) */}
              {book.status === 'reading' && (
                <div className="progress-panel">
                  <div className="progress-label">READING PROGRESS</div>
                  <div className="progress-track" style={{ marginBottom: '10px' }}>
                    <div className="progress-bar progress-bar--md" style={{ flex: 1 }}>
                      <span className="progress-bar-fill" style={{ width: `${readingPercent}%` }} />
                    </div>
                    <span className="progress-percent">{readingPercent}%</span>
                  </div>

                  {isAdmin && (
                    <form onSubmit={handleQuickProgressUpdate} className="progress-form">
                      <label className="progress-input">
                        <span>Page</span>
                        <input
                          type="number"
                          min="0"
                          max={book.pages || 9999}
                          value={quickPage}
                          onChange={(e) => setQuickPage(e.target.value)}
                        />
                        <span>of {book.pages || '—'}</span>
                      </label>
                      <button type="submit" className="btn btn--sm">
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishBook}
                        className="btn btn--primary btn--sm"
                        style={{ marginLeft: 'auto' }}
                      >
                        Finish book
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Detail Facts Grid */}
              <dl className="detail-facts">
                <div>
                  <dt>Genre</dt>
                  <dd>{book.genre ?? '—'}</dd>
                </div>
                <div>
                  <dt>Pages</dt>
                  <dd>{book.pages ? `${book.pages} pp` : '—'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <select
                      value={book.status}
                      onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                      style={{
                        font: 'inherit',
                        padding: '2px 6px',
                        background: 'var(--paper)',
                        border: '1.5px solid var(--ink)',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                      aria-label="Change reading status"
                    >
                      <option value="finished">Read</option>
                      <option value="reading">Reading</option>
                      <option value="want_to_read">TBR (To Read)</option>
                      <option value="dnf">Didn't Finish</option>
                    </select>
                  </dd>
                </div>
                <div>
                  <dt>{book.status === 'reading' ? 'Date Started' : 'Date Read'}</dt>
                  <dd>{fmtDate(book.finishedDate || book.startedDate)}</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>
                    {book.notes || book.review ? (
                      <span className="fact-flag fact-flag--yes">✓ Yes</span>
                    ) : (
                      <span className="fact-flag fact-flag--no">— None</span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* E-Book & Digital Reading Access Section */}
              <div
                style={{
                  marginTop: '18px',
                  background: 'var(--paper-deep, #f4f2ec)',
                  border: '2px solid var(--ink, #111)',
                  boxShadow: 'var(--hard, 2px 2px 0 var(--ink))',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display, monospace)',
                        fontSize: '10.5px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        background: 'var(--accent, #ff3b1f)',
                        color: '#ffffff',
                        padding: '2px 6px',
                        border: '1.5px solid var(--ink, #111)',
                      }}
                    >
                      ⚡ INSTANT DIGITAL ACCESS
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                      Free Downloads &amp; Reader
                    </span>
                  </div>
                  {book.isPublicDomain && (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#00994d', background: '#e6f4ea', padding: '2px 6px', border: '1px solid var(--ink)' }}>
                      ✓ PUBLIC DOMAIN
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {/* Read Online: Opens in-app Reader with frosted blur and CPA Locker */}
                  <button
                    type="button"
                    onClick={() => setIsReaderOpen(true)}
                    className="btn btn--primary btn--sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                    }}
                  >
                    📖 Read Online
                  </button>

                  {/* Direct PDF Download with Locker Protection */}
                  <button
                    type="button"
                    onClick={() => handleDownloadRequest('pdf')}
                    className="btn btn--sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      background: '#ffffff',
                    }}
                  >
                    ⬇️ Download PDF
                  </button>

                  {/* Direct EPUB Download with Locker Protection */}
                  <button
                    type="button"
                    onClick={() => handleDownloadRequest('epub')}
                    className="btn btn--sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      background: '#ffffff',
                    }}
                  >
                    ⬇️ Download EPUB
                  </button>
                </div>

                <div style={{ marginTop: '8px', fontSize: '10.5px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                  <span>🔒 Safe &amp; verified · Complete edition saved directly to your device</span>
                  {book.openSourceProvider && (
                    <span style={{ fontStyle: 'italic' }}>Source: {book.openSourceProvider}</span>
                  )}
                </div>
              </div>

              {/* Personal Notes & Editorial Reflections (Unlocked for all readers) */}
              <div style={{ marginTop: '20px', borderTop: '2px solid var(--line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span className="stat-tile-label" style={{ fontSize: '11px', color: 'var(--accent)' }}>
                    READING NOTES &amp; MARGINALIA
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notesSaveToast && (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                        ✓ {notesSaveToast}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className={`btn btn--sm ${isEditingNotes ? 'btn--primary' : ''}`}
                      style={{ fontSize: '11px', padding: '3px 9px' }}
                    >
                      {isEditingNotes ? 'Close Editor' : book.notes ? '✍️ Edit Notes' : '✍️ Add Notes'}
                    </button>
                  </div>
                </div>

                {isEditingNotes ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <RichNotesEditor
                      initialValue={readerNotes}
                      onSave={(val) => {
                        setReaderNotes(val);
                        LibraryStore.updateBook(book.id, { notes: val });
                        onBookUpdated();
                        setNotesSaveToast('Saved locally');
                        setTimeout(() => setNotesSaveToast(null), 2200);
                      }}
                      placeholder="Write your notes, key takeaways, and quotes for this volume..."
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--ink-soft)' }}>
                      <span>💾 Automatically saved to local device storage. No account required.</span>
                      <button
                        type="button"
                        className="btn btn--sm btn--primary"
                        onClick={() => setIsEditingNotes(false)}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {book.review && (
                      <blockquote
                        style={{
                          margin: 0,
                          padding: '12px 16px',
                          background: 'var(--paper-deep)',
                          borderLeft: '4px solid var(--accent)',
                          fontStyle: 'italic',
                          fontSize: '14px',
                          lineHeight: 1.6,
                        }}
                      >
                        "{book.review}"
                      </blockquote>
                    )}
                    {book.notes ? (
                      <div
                        style={{
                          margin: 0,
                          padding: '12px 14px',
                          background: '#ffffff',
                          border: '2px solid var(--ink)',
                          boxShadow: 'var(--hard)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                        }}
                        dangerouslySetInnerHTML={{ __html: book.notes }}
                      />
                    ) : (
                      !book.review && (
                        <div
                          style={{
                            padding: '16px',
                            background: 'var(--paper-deep)',
                            border: '1.5px dashed var(--hair)',
                            textAlign: 'center',
                          }}
                        >
                          <p style={{ color: 'var(--ink-soft)', fontSize: '13px', margin: '0 0 10px' }}>
                            No records found.
                          </p>
                          <button
                            type="button"
                            className="btn btn--sm btn--primary"
                            onClick={() => setIsEditingNotes(true)}
                            style={{ fontSize: '11.5px' }}
                          >
                            Add Notes
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              </div>
          </div>
        </div>

      {/* In-App Digital Reader with Frosted Blur & CPA Locker */}
      <BookPreviewReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        book={book}
        onBookUpdated={onBookUpdated}
      />

      {/* Direct Download CPA Locker Modal */}
      <CpaLockerModal
        isOpen={isDownloadLockerOpen}
        onClose={() => {
          setIsDownloadLockerOpen(false);
          setPendingDownloadFormat(null);
        }}
        onUnlocked={() => {
          setIsDownloadLockerOpen(false);
          if (pendingDownloadFormat) {
            triggerDownload(pendingDownloadFormat);
            setPendingDownloadFormat(null);
          }
        }}
        bookId={book.id}
        bookTitle={book.title}
        targetActionName={`Digital ${pendingDownloadFormat?.toUpperCase() || 'E-Book'} Download`}
        requiredOffers={2}
      />
    </div>
  );
}

