import React, { useState } from 'react';
import { BatchScraperEngine } from '../services/batch-scraper';
import { ScrapedBookResult } from '../services/scraper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBooksIngested: () => void;
}

const COMMON_GENRES = [
  'Philosophy',
  'Science Fiction',
  'Psychology',
  'History',
  'Classic Literature',
  'Mystery',
  'Dystopian',
  'Biography',
  'Economics',
  'Poetry',
];

export const BatchScraperModal: React.FC<Props> = ({ isOpen, onClose, onBooksIngested }) => {
  const [source, setSource] = useState<'subject' | 'isbns'>('subject');
  const [selectedSubject, setSelectedSubject] = useState('Philosophy');
  const [customTerm, setCustomTerm] = useState('');
  const [limit, setLimit] = useState(100);
  const [isbnList, setIsbnList] = useState('');

  // Scrape state
  const [isScraping, setIsScraping] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [scrapedResults, setScrapedResults] = useState<ScrapedBookResult[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  if (!isOpen) return null;

  const handleStartScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setProgressPercent(0);
    setScrapedResults([]);

    try {
      if (source === 'subject') {
        const term = customTerm.trim() || selectedSubject;
        setProgressText(`Scraping Open Library works for "${term}"...`);

        const results = await BatchScraperEngine.scrapeBySubject(
          term,
          limit,
          (current, total, latest) => {
            setProgressPercent(Math.round((current / total) * 100));
            setProgressText(`Scraped ${current}/${total}: ${latest}`);
          }
        );
        setScrapedResults(results);
      } else {
        const rawIsbns = isbnList
          .split(/[\n,]+/)
          .map((i) => i.trim())
          .filter(Boolean);

        setProgressText(`Fetching metadata for ${rawIsbns.length} ISBNs...`);
        const results = await BatchScraperEngine.scrapeByIsbnList(
          rawIsbns,
          (current, total, latest) => {
            setProgressPercent(Math.round((current / total) * 100));
            setProgressText(`Retrieved ${current}/${total}: ${latest}`);
          }
        );
        setScrapedResults(results);
      }
    } catch (err) {
      console.error(err);
      setProgressText('Scraping encountered an error. Check console.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleIngestAll = async () => {
    if (scrapedResults.length === 0) return;
    setIsIngesting(true);
    try {
      const count = await BatchScraperEngine.ingestToLibrary(scrapedResults);
      alert(`Successfully ingested ${count} books with external covers and pSEO metadata!`);
      onBooksIngested();
      onClose();
    } catch {
      alert('Ingestion failed.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '14px', marginBottom: '18px' }}>
          <h2 className="form-heading" style={{ margin: 0, fontSize: '26px' }}>
            Batch Metadata Importer
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Import bibliographic records and cover metadata by subject or ISBN list.
          </p>
        </div>

        {/* Source Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn btn--sm ${source === 'subject' ? 'btn--primary' : ''}`}
            onClick={() => setSource('subject')}
          >
            By Subject / Genre
          </button>
          <button
            type="button"
            className={`btn btn--sm ${source === 'isbns' ? 'btn--primary' : ''}`}
            onClick={() => setSource('isbns')}
          >
            By ISBN List
          </button>
        </div>

        {/* Scrape Controls Form */}
        <form onSubmit={handleStartScrape} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {source === 'subject' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span className="stat-tile-label" style={{ display: 'block', marginBottom: '6px' }}>
                  QUICK PRESET GENRES
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`chip ${selectedSubject === g && !customTerm ? 'chip--active' : ''}`}
                      onClick={() => {
                        setSelectedSubject(g);
                        setCustomTerm('');
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
                <label className="field">
                  <span>Or Custom Subject / Topic</span>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence, Architecture..."
                    value={customTerm}
                    onChange={(e) => setCustomTerm(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Batch Limit</span>
                  <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value={25}>25 books</option>
                    <option value={50}>50 books</option>
                    <option value={100}>100 books (+100)</option>
                    <option value={150}>150 books</option>
                    <option value={200}>200 books</option>
                    <option value={250}>250 books</option>
                  </select>
                </label>
              </div>
            </div>
          ) : (
            <label className="field">
              <span>Paste ISBNs (one per line or comma separated)</span>
              <textarea
                rows={4}
                placeholder="9780141036137&#10;9780062316097&#10;9780743273565"
                value={isbnList}
                onChange={(e) => setIsbnList(e.target.value)}
              />
            </label>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="submit" className="btn btn--primary" disabled={isScraping}>
              {isScraping ? 'Scraping Metadata...' : 'Start Scrape →'}
            </button>
            {isScraping && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                {progressText}
              </span>
            )}
          </div>
        </form>

        {scrapedResults.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Found {scrapedResults.length} Books Ready to Import
              </span>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleIngestAll}
                disabled={isIngesting}
              >
                {isIngesting ? 'Ingesting...' : `Ingest All ${scrapedResults.length} Books →`}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {scrapedResults.map((b, i) => (
                <div key={i} style={{ border: '1px solid var(--line)', padding: '6px', fontSize: '11px', background: '#fff' }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                  <div style={{ color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.author}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};