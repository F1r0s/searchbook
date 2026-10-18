import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import BookCover from './BookCover';
import StarRating from './StarRating';
import { LibraryStore } from '../services/library-store';
import { PALETTE } from '../lib/palette';
import { BookScraper } from '../services/scraper';
import { RichNotesEditor } from './RichNotesEditor';
import { BookPreviewReaderModal } from './BookPreviewReaderModal';

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
  const [isReaderPreviewOpen, setIsReaderPreviewOpen] = useState(false);

  // Lock background scroll while modal is mounted
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
  const [downloadPdfUrl, setDownloadPdfUrl] = useState(book.downloadPdfUrl || '');
  const [downloadEpubUrl, setDownloadEpubUrl] = useState(book.downloadEpubUrl || '');
  const [fileSize, setFileSize] = useState(book.fileSize || '');
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
      downloadPdfUrl: downloadPdfUrl.trim() || undefined,
      downloadEpubUrl: downloadEpubUrl.trim() || undefined,
      fileSize: fileSize.trim() || undefined,
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
                setDownloadPdfUrl(res.downloadPdfUrl || '');
                setDownloadEpubUrl(res.downloadEpubUrl || '');
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
    <div
      className="overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        zIndex: 9999,
        background: 'rgba(17, 17, 17, 0.68)',
        backdropFilter: 'blur(2px)',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="dialog dialog--detail"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'block',
          maxWidth: '780px',
          width: '100%',
          maxHeight: 'min(90vh, 920px)',
          overflowY: 'auto',
          margin: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top-right controls matching Bookplate exactly */}
        {isAdmin && (
          <button
            type="button"
            className="dialog-edit"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? 'Cancel editing' : 'Edit book'}
            title={isEditing ? 'Cancel editing' : 'Edit book record'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        )}

        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close"
          title="Close dialog"
        >
          ✕
        </button>

        {(!isEditing || !isAdmin) ? (
          /* ==================== VIEW MODE ==================== */
          <div className="detail-layout" style={{ display: 'flex', flexDirection: 'row', gap: '32px', width: '100%', alignItems: 'flex-start' }}>
            {/* Left Book Cover Column */}
            <div className="detail-cover" style={{ flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <BookCover book={book} size="lg" />

              {isAdmin && (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  style={{ fontSize: '11px', padding: '4px 8px', width: '100%' }}
                >
                  {showCoverPicker ? 'Close Cover Picker' : 'Change Cover Art'}
                </button>
              )}

              {isAdmin && showCoverPicker && (
                <div
                  style={{
                    background: 'var(--paper-deep)',
                    border: '2px solid var(--ink)',
                    padding: '10px',
                    boxShadow: 'var(--hard)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '11px', color: 'var(--accent)' }}>
                    BINDING CLOTH
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '10px' }}>
                    {PALETTE.map((c, idx) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          LibraryStore.updateBook(book.id, {
                            coverColor: c.bg,
                            colorIndex: idx,
                            coverImage: undefined,
                          });
                          onBookUpdated();
                          setShowCoverPicker(false);
                        }}
                        style={{
                          background: c.bg,
                          width: '18px',
                          height: '18px',
                          border: '1px solid var(--ink)',
                          cursor: 'pointer',
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>

                  <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '11px', color: 'var(--accent)' }}>
                    SEARCH OPEN LIBRARY
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Title or author..."
                      value={olQuery}
                      onChange={(e) => setOlQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchOpenLibrary(olQuery)}
                      style={{
                        width: '100%',
                        fontSize: '11px',
                        padding: '4px 6px',
                        border: '1px solid var(--ink)',
                        background: '#fff',
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => searchOpenLibrary(olQuery)}
                      disabled={isSearchingOl}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      {isSearchingOl ? '...' : 'Go'}
                    </button>
                  </div>

                  {olResults.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                      {olResults.filter((r) => r.coverUrl).map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (r.coverUrl) {
                              LibraryStore.updateBook(book.id, { coverImage: r.coverUrl });
                              onBookUpdated();
                              setShowCoverPicker(false);
                            }
                          }}
                          style={{
                            border: '1px solid var(--ink)',
                            padding: 0,
                            cursor: 'pointer',
                            background: '#fff',
                            aspectRatio: '2/3',
                            overflow: 'hidden',
                          }}
                          title={r.title}
                        >
                          <img src={r.coverUrl} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Book Detail Body Column */}
            <div className="detail-body" style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <span className="detail-kicker">
                {isAdmin ? getStatusLabel(book.status) : (book.isPublicDomain ? 'OPEN ACCESS' : 'DIGITAL EDITION')}
              </span>
              <h2 className="detail-title">{book.title}</h2>
              <p className="detail-author">by {book.author}</p>

              <div className="detail-rating">
                <StarRating value={book.rating} onChange={isAdmin ? handleRatingChange : undefined} size="lg" />
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
                    {isAdmin ? (
                      <select
                        value={book.status}
                        onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                        style={{
                          font: 'inherit',
                          padding: '2px 6px',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          fontWeight: 600,
                          fontSize: '13px',
                        }}
                      >
                        <option value="finished">Read</option>
                        <option value="reading">Reading</option>
                        <option value="want_to_read">TBR (To Read)</option>
                        <option value="dnf">Didn't Finish</option>
                      </select>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{getStatusLabel(book.status)}</span>
                    )}
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

              {/* Digital Download Center & Format Hub */}
              <div style={{ marginTop: '16px', width: '100%', boxSizing: 'border-box', border: '2px solid var(--ink)', background: 'var(--paper-deep)', padding: '16px', boxShadow: 'var(--hard)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="stat-tile-label" style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 800 }}>
                    DOWNLOAD CENTER &amp; FORMATS
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {book.downloadCount !== undefined && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)' }}>
                        {book.downloadCount.toLocaleString()} downloads
                      </span>
                    )}
                    {book.isPublicDomain && (
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', background: 'var(--accent)', padding: '2px 6px', border: '1px solid var(--ink)' }}>
                        OPEN ACCESS
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {/* Universal In-App Preview / Read Button for Every Book */}
                  <button
                    type="button"
                    onClick={() => setIsReaderPreviewOpen(true)}
                    className="btn btn--primary"
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 800,
                      padding: '8px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--ink)',
                      color: '#ffffff',
                    }}
                  >
                    <span>📖</span>
                    <span>Preview &amp; Read Volume</span>
                  </button>

                  {book.downloadPdfUrl && (
                    <a
                      href={book.downloadPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        LibraryStore.recordDownload(book.id, 'pdf');
                        onBookUpdated();
                      }}
                      className="btn"
                      style={{ fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}
                    >
                      ⬇ Download PDF {book.fileSize ? `(${book.fileSize})` : ''}
                    </a>
                  )}

                  {book.downloadEpubUrl && (
                    <a
                      href={book.downloadEpubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        LibraryStore.recordDownload(book.id, 'epub');
                        onBookUpdated();
                      }}
                      className="btn"
                      style={{ background: '#1a34d6', color: '#fff', fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}
                    >
                      ⬇ Download EPUB
                    </a>
                  )}

                  {book.readOnlineUrl && (
                    <a
                      href={book.readOnlineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--accent"
                      style={{ fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                    >
                      📖 Read Free Online ↗
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
                      👁️ Digital Scan / Borrow ↗
                    </a>
                  )}

                  {!book.downloadPdfUrl && !book.downloadEpubUrl && !book.readOnlineUrl && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%' }}>
                      <a
                        href={`https://archive.org/search.php?query=${encodeURIComponent(book.title + ' ' + book.author)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--sm"
                        style={{ fontSize: '11px', textDecoration: 'none' }}
                      >
                        Search Internet Archive Mirrors ↗
                      </a>
                      <a
                        href={`https://books.google.com/books?q=${encodeURIComponent(book.title + ' ' + book.author)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--sm"
                        style={{ fontSize: '11px', textDecoration: 'none' }}
                      >
                        Search Google Books ↗
                      </a>
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={handleAutoFindEbook}
                      disabled={isFindingEbook}
                      style={{ fontSize: '11px', padding: '4px 8px', marginLeft: 'auto' }}
                      title="Re-query open repositories for direct PDF & EPUB links"
                    >
                      {isFindingEbook ? 'Scanning archives...' : '⚡ Scan for E-Book Links'}
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Notes Studio & Formatting Suite */}
              <div style={{ marginTop: '20px', borderTop: '2px solid var(--line)', paddingTop: '16px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="stat-tile-label" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800 }}>
                    READING NOTES &amp; ANNOTATIONS
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    Word &amp; Paint formatting studio
                  </span>
                </div>

                {book.review && (
                  <blockquote
                    style={{
                      margin: '0 0 12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      background: 'var(--paper-deep)',
                      borderLeft: '4px solid var(--accent)',
                      fontStyle: 'italic',
                      fontSize: '13.5px',
                      lineHeight: 1.5,
                    }}
                  >
                    "{book.review}"
                  </blockquote>
                )}

                {/* Live White Formatting Canvas for Every Reader */}
                <RichNotesEditor
                  initialValue={book.notes || ''}
                  onSave={(newNotes) => {
                    LibraryStore.updateBook(book.id, { notes: newNotes });
                    setNotes(newNotes);
                    onBookUpdated();
                  }}
                />
              </div>

              {/* Bottom Actions Row — admin only */}
              {isAdmin && (
                <div className="dialog-actions" style={{ marginTop: '24px' }}>
                  {book.status !== 'finished' && (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => handleStatusChange('finished')}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit details
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={handleDelete}
                    style={{ marginLeft: 'auto' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : isAdmin ? (
          /* ==================== EDIT RECORD MODE (admin only) ==================== */
          <form onSubmit={handleSaveFullEdit}>
            <h2 className="form-heading">Edit Book Record</h2>

            <div className="book-form">
              <label className="field field--wide">
                <span>Title *</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="field field--wide">
                <span>Author *</span>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Genre</span>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Total Pages</span>
                <input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Reading Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                >
                  <option value="finished">Read</option>
                  <option value="reading">Reading</option>
                  <option value="want_to_read">To Read (TBR)</option>
                  <option value="dnf">Didn't Finish</option>
                </select>
              </label>

              <label className="field">
                <span>Current Page (if reading)</span>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                />
              </label>

              <label className="field field--wide">
                <span>Rating</span>
                <div style={{ paddingTop: '4px' }}>
                  <StarRating value={rating} onChange={(val) => setRating(val)} size="md" />
                </div>
              </label>

              <label className="field">
                <span>Date Started</span>
                <input
                  type="date"
                  value={startedDate}
                  onChange={(e) => setStartedDate(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Date Finished</span>
                <input
                  type="date"
                  value={finishedDate}
                  onChange={(e) => setFinishedDate(e.target.value)}
                />
              </label>

              <label className="field field--wide">
                <span>Cover Image URL (or Open Library cover)</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </label>

              <div className="field field--wide">
                <span>Or Binding Cloth Swatch</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {PALETTE.map((c, idx) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setColorIndex(idx);
                        setCoverImage('');
                      }}
                      style={{
                        background: c.bg,
                        height: '24px',
                        border: colorIndex === idx && !coverImage ? '2px solid var(--ink)' : '1px solid var(--hair)',
                        boxShadow: colorIndex === idx && !coverImage ? '2px 2px 0 var(--ink)' : 'none',
                        cursor: 'pointer',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="field field--wide">
                <label className="field" style={{ margin: 0 }}>
                  <span>Direct Download PDF URL</span>
                  <input
                    type="url"
                    placeholder="https://.../book.pdf"
                    value={downloadPdfUrl}
                    onChange={(e) => setDownloadPdfUrl(e.target.value)}
                  />
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span>Direct Download EPUB URL</span>
                  <input
                    type="url"
                    placeholder="https://.../book.epub"
                    value={downloadEpubUrl}
                    onChange={(e) => setDownloadEpubUrl(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '10px' }} className="field field--wide">
                <label className="field" style={{ margin: 0 }}>
                  <span>Read Free Online URL</span>
                  <input
                    type="url"
                    placeholder="https://archive.org/stream/..."
                    value={readOnlineUrl}
                    onChange={(e) => setReadOnlineUrl(e.target.value)}
                  />
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span>Preview / Archive Details URL</span>
                  <input
                    type="url"
                    placeholder="https://openlibrary.org/..."
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                  />
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span>File Size</span>
                  <input
                    type="text"
                    placeholder="e.g. 1.8 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                  />
                </label>
              </div>

              <label className="field field--wide">
                <span>Personal Review</span>
                <textarea
                  rows={2}
                  placeholder="Brief editorial critique or summary..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </label>

              <label className="field field--wide">
                <span>Reading Notes / Marginalia</span>
                <textarea
                  rows={4}
                  placeholder="Passages, thoughts, chapter reflections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
              >
                Save Record
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDelete}
                style={{ marginLeft: 'auto' }}
              >
                Delete Book
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* Universal In-App Digital Reader & Preview Modal */}
      <BookPreviewReaderModal
        isOpen={isReaderPreviewOpen}
        onClose={() => setIsReaderPreviewOpen(false)}
        book={book}
        onBookUpdated={onBookUpdated}
      />
    </div>
  );
}
