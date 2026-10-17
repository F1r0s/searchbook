import React, { useState } from 'react';
import { Book, ReadingStatus } from '../types';
import { LibraryStore } from '../services/library-store';
import BookCover from './BookCover';
import StarRating from './StarRating';
import { PALETTE } from '../lib/palette';

import { BookScraper } from '../services/scraper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

interface ScrapedBookDoc {
  title: string;
  author: string;
  year?: number;
  pages?: number;
  coverUrl?: string;
  genre?: string;
  synopsis?: string;
  rating?: number;
  readOnlineUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  isPublicDomain?: boolean;
  openSourceProvider?: string;
}

export const AddBookModal: React.FC<Props> = ({ isOpen, onClose, onBookAdded }) => {
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ScrapedBookDoc[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Literature');
  const [pages, setPages] = useState('320');
  const [currentPage, setCurrentPage] = useState('0');
  const [status, setStatus] = useState<ReadingStatus>('reading');
  const [rating, setRating] = useState(0);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [colorIndex, setColorIndex] = useState(0);
  const [coverImage, setCoverImage] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [readOnlineUrl, setReadOnlineUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isPublicDomain, setIsPublicDomain] = useState(false);
  const [openSourceProvider, setOpenSourceProvider] = useState('');

  if (!isOpen) return null;

  const handleSearchBooks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await BookScraper.searchBooks(searchQuery, 12);
      const docs: ScrapedBookDoc[] = results.map((r) => ({
        title: r.title,
        author: r.author,
        year: r.year,
        pages: r.pages,
        coverUrl: r.coverImage,
        genre: r.genre,
        synopsis: r.synopsis,
        rating: r.rating,
        readOnlineUrl: r.readOnlineUrl,
        previewUrl: r.previewUrl,
        downloadUrl: r.downloadUrl,
        isPublicDomain: r.isPublicDomain,
        openSourceProvider: r.openSourceProvider,
      }));
      setSearchResults(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (doc: ScrapedBookDoc) => {
    setTitle(doc.title);
    setAuthor(doc.author);
    if (doc.genre) setGenre(doc.genre);
    if (doc.pages) setPages(doc.pages.toString());
    if (doc.coverUrl) setCoverImage(doc.coverUrl);
    if (doc.synopsis) setSynopsis(doc.synopsis);
    if (doc.year) setYear(doc.year);
    if (typeof doc.rating === 'number' && doc.rating > 0) setRating(doc.rating);
    setReadOnlineUrl(doc.readOnlineUrl || '');
    setPreviewUrl(doc.previewUrl || '');
    setDownloadUrl(doc.downloadUrl || '');
    setIsPublicDomain(Boolean(doc.isPublicDomain));
    setOpenSourceProvider(doc.openSourceProvider || '');
    setMode('manual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const authorSlug = author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const parsedPages = parseInt(pages, 10) || 250;
    const parsedCurrentPage = parseInt(currentPage, 10) || 0;
    const today = new Date().toISOString().split('T')[0];

    LibraryStore.addBook({
      slug: slug || `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      authorSlug,
      year: year || new Date().getFullYear(),
      pages: parsedPages,
      currentPage: status === 'reading' ? parsedCurrentPage : (status === 'finished' ? parsedPages : 0),
      genre: genre.trim() || 'General',
      status,
      rating: Number(rating) || 0,
      coverColor: PALETTE[colorIndex].bg,
      colorIndex,
      coverImage: coverImage.trim() || undefined,
      synopsis: synopsis.trim() || `Added to library shelf.`,
      review: review.trim(),
      notes: notes.trim(),
      startedDate: status === 'reading' || status === 'finished' ? today : undefined,
      finishedDate: status === 'finished' ? today : undefined,
      readOnlineUrl: readOnlineUrl.trim() || undefined,
      previewUrl: previewUrl.trim() || undefined,
      downloadUrl: downloadUrl.trim() || undefined,
      isPublicDomain,
      openSourceProvider: openSourceProvider.trim() || undefined,
    });

    onBookAdded();
    onClose();
  };

  const previewBook: Book = {
    id: 'preview',
    slug: 'preview',
    title: title || 'Title of the Book',
    author: author || 'Author Name',
    year: year || 2026,
    genre: genre || 'Genre',
    pages: parseInt(pages, 10) || 200,
    rating,
    status,
    coverColor: PALETTE[colorIndex].bg,
    colorIndex,
    coverImage: coverImage || undefined,
    synopsis: synopsis || '',
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog dialog--form"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '740px' }}
      >
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid var(--line)', paddingBottom: '12px' }}>
          <h2 className="form-heading" style={{ margin: 0 }}>Add Book to Shelf</h2>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`btn btn--sm ${mode === 'search' ? 'btn--primary' : ''}`}
              onClick={() => setMode('search')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Search Books
            </button>
            <button
              type="button"
              className={`btn btn--sm ${mode === 'manual' ? 'btn--primary' : ''}`}
              onClick={() => setMode('manual')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Manual Entry
            </button>
          </div>
        </div>

        {mode === 'search' ? (
          <div>
            <form onSubmit={handleSearchBooks} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                autoFocus
                placeholder="Search title, author, or ISBN (e.g. Dune, Kafka, 1984)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '15px',
                  border: '2px solid var(--ink)',
                  background: '#ffffff',
                }}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSearching}
                style={{ minWidth: '100px' }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', maxHeight: '420px', overflowY: 'auto', padding: '4px' }}>
                {searchResults.map((doc, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelectSearchResult(doc)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        textAlign: 'left',
                        background: '#ffffff',
                        border: '2px solid var(--ink)',
                        boxShadow: 'var(--hard)',
                        padding: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-2px, -2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                      <div style={{ aspectRatio: '2/3', background: 'var(--paper-deep)', marginBottom: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        {doc.coverUrl ? (
                          <img
                            src={doc.coverUrl}
                            alt={doc.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--ink-soft)', padding: '6px', textAlign: 'center' }}>
                            {doc.title}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.2, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.author}
                      </div>
                      {doc.isPublicDomain ? (
                        <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>
                          📖 Public Domain
                        </div>
                      ) : doc.previewUrl ? (
                        <div style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          👁️ Online Preview
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-soft)', border: '2px dashed var(--hair)', background: 'var(--paper-deep)' }}>
                <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Search millions of books from Open Library</p>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Enter any book title or author to fetch cover art, page count, and publication details.
                </p>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => setMode('manual')}
                  style={{ marginTop: '16px', fontSize: '12px' }}
                >
                  Or enter book details manually →
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '24px' }}>
              {/* Left Column: Live Bookplate Cover */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '150px' }}>
                  <BookCover book={previewBook} />
                </div>

                <div style={{ marginTop: '14px', width: '100%' }}>
                  <span className="cover-topline" style={{ display: 'block', marginBottom: '6px', textAlign: 'center', fontSize: '10px', fontWeight: 700 }}>
                    BINDING CLOTH
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
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
                          width: '100%',
                          aspectRatio: '1',
                          border: colorIndex === idx && !coverImage ? '2px solid var(--ink)' : '1px solid var(--hair)',
                          boxShadow: colorIndex === idx && !coverImage ? '2px 2px 0 var(--ink)' : 'none',
                          cursor: 'pointer',
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Form Inputs */}
              <div className="book-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="field">
                  <span>Title *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meditations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Author *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Aurelius"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label className="field">
                    <span>Reading Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                    >
                      <option value="reading">Reading</option>
                      <option value="finished">Read</option>
                      <option value="want_to_read">To Read (TBR)</option>
                      <option value="dnf">Didn't Finish</option>
                    </select>
                  </label>
                  {status === 'reading' ? (
                    <label className="field">
                      <span>Current Page</span>
                      <input
                        type="number"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                      />
                    </label>
                  ) : (
                    <label className="field">
                      <span>Rating (0–5)</span>
                      <div style={{ paddingTop: '6px' }}>
                        <StarRating value={rating} onChange={(val) => setRating(val)} size="md" />
                      </div>
                    </label>
                  )}
                </div>

                <label className="field">
                  <span>Cover Image URL (optional)</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Synopsis / Description (optional)</span>
                  <textarea
                    rows={2}
                    placeholder="Book synopsis or overview..."
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Review (optional)</span>
                  <textarea
                    rows={2}
                    placeholder="Initial thoughts or review..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Reading Notes (optional)</span>
                  <textarea
                    rows={2}
                    placeholder="Notes, key quotes, chapter impressions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label className="field">
                    <span>Read Free Online URL (optional)</span>
                    <input
                      type="url"
                      placeholder="e.g. https://archive.org/stream/..."
                      value={readOnlineUrl}
                      onChange={(e) => setReadOnlineUrl(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Preview URL (optional)</span>
                    <input
                      type="url"
                      placeholder="e.g. https://openlibrary.org/..."
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="dialog-actions" style={{ marginTop: '20px', borderTop: '2px solid var(--line)', paddingTop: '16px' }}>
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Save to Library
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
