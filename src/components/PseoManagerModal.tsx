import React, { useState } from 'react';
import { Globe, Download, FileCode, Layers, RefreshCw } from 'lucide-react';
import { PseoService, PseoTemplate } from '../services/pseo-service';
import { SitemapService, SITEMAP_CHUNK_SIZE } from '../services/sitemap-service';
import { Book } from '../types';

interface Props {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
  onBooksUpdated?: () => void;
}

export const PseoManagerModal: React.FC<Props> = ({
  isOpen,
  books,
  onClose,
  onBooksUpdated,
}) => {
  const [tab, setTab] = useState<'templates' | 'generator' | 'sitemaps'>('templates');
  const [templates, setTemplates] = useState<Record<string, PseoTemplate>>(PseoService.getTemplates());
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('book');
  const [activeLocale, setActiveLocale] = useState<'en' | 'es' | 'fr' | 'pt'>('en');
  const [xmlPreview, setXmlPreview] = useState<string>(() => SitemapService.generateSitemapIndex(books.length));
  const [activeSitemapName, setActiveSitemapName] = useState<string>('sitemap.xml');
  const [bulkCount, setBulkCount] = useState<number>(1000);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTmpl = templates[activeTemplateKey] || templates.book;
  const totalChunks = Math.max(1, Math.ceil(books.length / SITEMAP_CHUNK_SIZE));
  const sampleBook: Book = books[0] || {
    id: 'atomic-habits',
    slug: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    genre: 'Self-Help / Psychology',
    pages: 320,
    rating: 4.5,
    status: 'want_to_read',
    synopsis: 'An easy and proven way to build good habits and break bad ones.',
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    PseoService.saveTemplates(templates);
    setStatusMessage('Programmatic SEO templates saved.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleResetTemplates = () => {
    const defaults = PseoService.resetTemplates();
    setTemplates(defaults);
    setStatusMessage('Templates restored to institutional defaults.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleGenerateBulkPages = () => {
    const result = PseoService.generateBulkPseoCatalog(bulkCount);
    if (onBooksUpdated) onBooksUpdated();
    const updatedIndex = SitemapService.generateSitemapIndex(result.total);
    setXmlPreview(updatedIndex);
    setActiveSitemapName('sitemap.xml');
    setStatusMessage(`Generated ${result.added.toLocaleString()} new pSEO pages (${result.total.toLocaleString()} total volumes indexed across ${Math.ceil(result.total / SITEMAP_CHUNK_SIZE)} sitemap partitions).`);
  };

  const handlePreviewSitemapIndex = () => {
    setActiveSitemapName('sitemap.xml');
    setXmlPreview(SitemapService.generateSitemapIndex(books.length));
  };

  const handlePreviewStaticSitemap = () => {
    setActiveSitemapName('sitemap_static.xml');
    setXmlPreview(SitemapService.generateStaticSitemap());
  };

  const handlePreviewSitemapChunk = (chunkIndex: number) => {
    setActiveSitemapName(`sitemap_${chunkIndex}.xml`);
    setXmlPreview(SitemapService.generateBookChunkSitemap(books, chunkIndex));
  };

  const getFieldKey = (prefix: 'title' | 'desc' | 'h1' | 'subtitle'): keyof PseoTemplate => {
    const suffix = activeLocale === 'es' ? 'Es' : activeLocale === 'fr' ? 'Fr' : activeLocale === 'pt' ? 'Pt' : 'En';
    return `${prefix}${suffix}` as keyof PseoTemplate;
  };

  const livePreviewMeta = PseoService.renderBookMeta(sampleBook, activeLocale);

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Clean Institutional Header: Semantic Icon + Primary Title + Concise 1-Line Subtitle */}
        <header style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '16px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={26} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <h2 className="form-heading" style={{ margin: 0, fontSize: '26px' }}>
              Programmatic SEO &amp; Sitemap Engine
            </h2>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
            Configure multilingual metadata templates, generate thousands of indexable pages, and export partitioned XML sitemaps.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'templates' ? 'btn--primary' : ''}`}
            onClick={() => setTab('templates')}
          >
            <FileCode size={14} /> Metadata Templates
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'generator' ? 'btn--primary' : ''}`}
            onClick={() => setTab('generator')}
          >
            <Layers size={14} /> Bulk Page Generator ({books.length.toLocaleString()} Volumes)
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tab === 'sitemaps' ? 'btn--primary' : ''}`}
            onClick={() => {
              setTab('sitemaps');
              handlePreviewSitemapIndex();
            }}
          >
            <Download size={14} /> Partitioned Sitemaps ({totalChunks} Chunks)
          </button>
        </div>

        {statusMessage && (
          <div
            style={{
              background: '#e8f5e9',
              border: '2px solid #2e7d32',
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1b5e20',
              marginBottom: '14px',
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Tab 1: Multilingual Metadata Templates Editor */}
        {tab === 'templates' && currentTmpl && (
          <form
            onSubmit={handleSaveTemplates}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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

              <div style={{ display: 'inline-flex', border: '2px solid var(--ink)', background: '#fff' }}>
                {(['en', 'es', 'fr', 'pt'] as const).map((lang, idx) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLocale(lang)}
                    style={{
                      border: 'none',
                      borderLeft: idx > 0 ? '1px solid var(--ink)' : 'none',
                      background: activeLocale === lang ? 'var(--ink)' : '#fff',
                      color: activeLocale === lang ? '#fff' : 'var(--ink)',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>H1 Primary Heading Pattern ({activeLocale.toUpperCase()})</span>
                <input
                  type="text"
                  value={currentTmpl[getFieldKey('h1')]}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTemplateKey]: {
                        ...currentTmpl,
                        [getFieldKey('h1')]: e.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="field">
                <span>1-Line Subtitle Pattern ({activeLocale.toUpperCase()})</span>
                <input
                  type="text"
                  value={currentTmpl[getFieldKey('subtitle')]}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTemplateKey]: {
                        ...currentTmpl,
                        [getFieldKey('subtitle')]: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>SERP Meta Title Pattern ({activeLocale.toUpperCase()})</span>
              <input
                type="text"
                value={currentTmpl[getFieldKey('title')]}
                onChange={(e) =>
                  setTemplates({
                    ...templates,
                    [activeTemplateKey]: {
                      ...currentTmpl,
                      [getFieldKey('title')]: e.target.value,
                    },
                  })
                }
              />
            </label>

            <label className="field">
              <span>SERP Meta Description Pattern ({activeLocale.toUpperCase()})</span>
              <textarea
                rows={2}
                value={currentTmpl[getFieldKey('desc')]}
                onChange={(e) =>
                  setTemplates({
                    ...templates,
                    [activeTemplateKey]: {
                      ...currentTmpl,
                      [getFieldKey('desc')]: e.target.value,
                    },
                  })
                }
              />
            </label>

            {/* Live Search Engine Snippet Preview */}
            <div style={{ border: '2px solid var(--ink)', background: 'var(--paper)', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                Live Search Engine Result Preview ({activeLocale.toUpperCase()})
              </div>
              <div style={{ fontSize: '12px', color: '#006621', marginBottom: '2px' }}>
                {livePreviewMeta.canonicalUrl}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a0dab', marginBottom: '4px' }}>
                {livePreviewMeta.metaTitle}
              </div>
              <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.4 }}>
                {livePreviewMeta.metaDescription}
              </div>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                Supported tokens: <code>{'{title}'}</code>, <code>{'{author}'}</code>, <code>{'{genre}'}</code>, <code>{'{pages}'}</code>, <code>{'{year}'}</code>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn--sm" onClick={handleResetTemplates}>
                  <RefreshCw size={13} /> Reset Defaults
                </button>
                <button type="submit" className="btn btn--primary btn--sm">
                  Save Templates
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Automated Bulk pSEO Generator */}
        {tab === 'generator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div className="stat-tiles" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-tile">
                <span className="stat-tile-label">INDEXED VOLUMES</span>
                <span className="stat-tile-value" style={{ fontSize: '34px' }}>
                  {books.length.toLocaleString()}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Active catalog records</span>
              </div>
              <div className="stat-tile">
                <span className="stat-tile-label">INDEXABLE PSEO URLS</span>
                <span className="stat-tile-value" style={{ fontSize: '34px' }}>
                  {(books.length * 5 + 28).toLocaleString()}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Canonical + EN, ES, FR, PT</span>
              </div>
              <div className="stat-tile">
                <span className="stat-tile-label">SITEMAP PARTITIONS</span>
                <span className="stat-tile-value" style={{ fontSize: '34px' }}>
                  {totalChunks}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                  sitemap_1.xml – sitemap_{totalChunks}.xml
                </span>
              </div>
            </div>

            <div style={{ border: '2px solid var(--ink)', padding: '18px', background: '#fff', boxShadow: 'var(--hard)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', margin: '0 0 6px' }}>
                Automated Programmatic Page Generator
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 14px' }}>
                Generate structured bibliographic entries across 40 authors, 25 academic subjects, and 8 archival editions. All generated pages are immediately indexed into partitioned sitemaps.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                  <span>Batch Size:</span>
                  <select
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="sort-select"
                  >
                    <option value={250}>+250 Volumes (1,250 localized URLs)</option>
                    <option value={500}>+500 Volumes (2,500 localized URLs)</option>
                    <option value={1000}>+1,000 Volumes (5,000 localized URLs)</option>
                    <option value={2500}>+2,500 Volumes (12,500 localized URLs)</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleGenerateBulkPages}
                >
                  <Layers size={15} /> Generate pSEO Pages Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Partitioned Sitemap Inspector & Exporter */}
        {tab === 'sitemaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn--sm ${activeSitemapName === 'sitemap.xml' ? 'btn--primary' : ''}`}
                  onClick={handlePreviewSitemapIndex}
                >
                  sitemap.xml (Index)
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${activeSitemapName === 'sitemap_static.xml' ? 'btn--primary' : ''}`}
                  onClick={handlePreviewStaticSitemap}
                >
                  sitemap_static.xml
                </button>
                {Array.from({ length: totalChunks }, (_, i) => i + 1).map((chunk) => (
                  <button
                    key={chunk}
                    type="button"
                    className={`btn btn--sm ${activeSitemapName === `sitemap_${chunk}.xml` ? 'btn--primary' : ''}`}
                    onClick={() => handlePreviewSitemapChunk(chunk)}
                  >
                    sitemap_{chunk}.xml
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => SitemapService.downloadXml(activeSitemapName, xmlPreview)}
              >
                <Download size={13} /> Download {activeSitemapName}
              </button>
            </div>

            <pre
              style={{
                flex: 1,
                maxHeight: '320px',
                overflow: 'auto',
                padding: '14px',
                background: 'var(--ink)',
                color: '#fff',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                border: '2px solid var(--ink)',
                margin: 0,
              }}
            >
              {xmlPreview}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};