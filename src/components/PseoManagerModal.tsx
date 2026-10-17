import React, { useState } from 'react';
import { PseoService, PseoTemplate } from '../services/pseo-service';
import { SitemapService, SITEMAP_CHUNK_SIZE } from '../services/sitemap-service';
import { Book } from '../types';

interface Props {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
}

export const PseoManagerModal: React.FC<Props> = ({ isOpen, books, onClose }) => {
  const [tab, setTab] = useState<'templates' | 'sitemaps' | 'generator'>('templates');
  const [templates, setTemplates] = useState<Record<string, PseoTemplate>>(PseoService.getTemplates());
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('book');
  const [xmlPreview, setXmlPreview] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTmpl = templates[activeTemplateKey];
  const totalChunks = Math.max(1, Math.ceil(books.length / SITEMAP_CHUNK_SIZE));

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    PseoService.saveTemplates(templates);
    setStatusMessage('pSEO templates successfully updated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handlePreviewSitemapIndex = () => {
    const xml = SitemapService.generateSitemapIndex(books.length);
    setXmlPreview(xml);
  };

  const handlePreviewSitemapChunk = (chunkIndex: number) => {
    const dbBooks = books as any[];
    const xml = SitemapService.generateBookChunkSitemap(dbBooks, chunkIndex);
    setXmlPreview(xml);
  };

  const handleDownloadSitemapIndex = () => {
    const xml = SitemapService.generateSitemapIndex(books.length);
    SitemapService.downloadXml('sitemap.xml', xml);
  };

  const handleDownloadSitemapChunk = (chunkIndex: number) => {
    const dbBooks = books as any[];
    const xml = SitemapService.generateBookChunkSitemap(dbBooks, chunkIndex);
    SitemapService.downloadXml(`sitemap_${chunkIndex}.xml`, xml);
  };

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '14px', marginBottom: '18px' }}>
          <span className="sec-kicker" style={{ fontSize: '10px', color: 'var(--accent)' }}>
            AUTOMATION &amp; INDEXING
          </span>
          <h2 className="form-heading" style={{ margin: '4px 0 0', fontSize: '26px' }}>
            pSEO Engine &amp; Partitioned Sitemaps
          </h2>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'templates' ? 'btn--primary' : ''}`}
            onClick={() => setTab('templates')}
          >
            Metadata Templates
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'sitemaps' ? 'btn--primary' : ''}`}
            onClick={() => {
              setTab('sitemaps');
              handlePreviewSitemapIndex();
            }}
          >
            Sitemap Index ({totalChunks} child sitemaps)
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'generator' ? 'btn--primary' : ''}`}
            onClick={() => setTab('generator')}
          >
            Crawl Readiness &amp; Stats
          </button>
        </div>

        {statusMessage && (
          <div style={{ background: '#e8f5e9', border: '2px solid #2e7d32', padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#1b5e20', marginBottom: '14px' }}>
            {statusMessage}
          </div>
        )}

        {/* Tab 1: Templates Editor */}
        {tab === 'templates' && currentTmpl && (
          <form onSubmit={handleSaveTemplates} style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.values(templates).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTemplateKey(t.key)}
                  className={`chip ${activeTemplateKey === t.key ? 'chip--active' : ''}`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--accent)' }}>ENGLISH (EN)</span>
                <label className="field">
                  <span>Meta Title Pattern</span>
                  <input
                    type="text"
                    value={currentTmpl.titleEn}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplateKey]: { ...currentTmpl, titleEn: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>Meta Description Pattern</span>
                  <textarea
                    rows={3}
                    value={currentTmpl.descEn}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplateKey]: { ...currentTmpl, descEn: e.target.value },
                      })
                    }
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--accent)' }}>FRENCH (FR)</span>
                <label className="field">
                  <span>Modèle de Titre Meta</span>
                  <input
                    type="text"
                    value={currentTmpl.titleFr}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplateKey]: { ...currentTmpl, titleFr: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>Modèle de Description Meta</span>
                  <textarea
                    rows={3}
                    value={currentTmpl.descFr}
                    onChange={(e) =>
                      setTemplates({
                        ...templates,
                        [activeTemplateKey]: { ...currentTmpl, descFr: e.target.value },
                      })
                    }
                  />
                </label>
              </div>
            </div>

            <div style={{ background: 'var(--paper-deep)', border: '1px solid var(--ink)', padding: '10px', fontSize: '11px', color: 'var(--ink-soft)' }}>
              Variables available: <code>{'{title}'}</code>, <code>{'{author}'}</code>, <code>{'{genre}'}</code>, <code>{'{pages}'}</code>, <code>{'{year}'}</code>
            </div>

            <div className="dialog-actions" style={{ marginTop: '8px' }}>
              <button type="submit" className="btn btn--primary">
                Save Patterns
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Sitemaps Inspector */}
        {tab === 'sitemaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn--sm" onClick={handlePreviewSitemapIndex}>
                  View sitemap.xml
                </button>
                {Array.from({ length: totalChunks }, (_, i) => i + 1).map((chunk) => (
                  <button
                    key={chunk}
                    type="button"
                    className="btn btn--sm"
                    onClick={() => handlePreviewSitemapChunk(chunk)}
                  >
                    View sitemap_{chunk}.xml
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn--primary btn--sm" onClick={handleDownloadSitemapIndex}>
                  Export sitemap.xml
                </button>
                <button type="button" className="btn btn--sm" onClick={() => handleDownloadSitemapChunk(1)}>
                  Export sitemap_1.xml
                </button>
              </div>
            </div>

            <pre
              style={{
                flex: 1,
                maxHeight: '340px',
                overflow: 'auto',
                padding: '14px',
                background: 'var(--ink)',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                border: '2px solid var(--ink)',
              }}
            >
              {xmlPreview}
            </pre>
          </div>
        )}

        {/* Tab 3: Crawl Readiness */}
        {tab === 'generator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            <div className="stat-tiles" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-tile">
                <span className="stat-tile-label">INDEXABLE TITLES</span>
                <span className="stat-value" style={{ fontSize: '32px', fontWeight: 800, display: 'block' }}>
                  {books.length}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Scraped books</span>
              </div>
              <div className="stat-tile">
                <span className="stat-tile-label">TOTAL PSEO URLS</span>
                <span className="stat-value" style={{ fontSize: '32px', fontWeight: 800, display: 'block' }}>
                  {books.length * 2 + 8}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>EN &amp; FR localized routes</span>
              </div>
              <div className="stat-tile">
                <span className="stat-tile-label">SITEMAP CHUNKS</span>
                <span className="stat-value" style={{ fontSize: '32px', fontWeight: 800, display: 'block' }}>
                  {totalChunks}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Partitioned for search bots</span>
              </div>
            </div>

            <div style={{ border: '2px solid var(--ink)', padding: '16px', background: '#fff' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800 }}>Search Crawler Checklist</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 800 }}>✓</span> Root <code>sitemap.xml</code> index partitions links into chunks of 5,000 URLs.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 800 }}>✓</span> Both <code>hreflang="en"</code> and <code>hreflang="fr"</code> self-referencing tags injected in every URL.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 800 }}>✓</span> Schema.org <code>Book</code> JSON-LD structured data generated per title for rich snippet display.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 800 }}>✓</span> Covers referenced via external URLs without consuming cloud media storage.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};