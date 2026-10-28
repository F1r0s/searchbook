import React, { useState } from 'react';
import { Shield, Plus, Database, Globe, ArrowLeft, Lock, Trash2, Edit3, Check, X } from 'lucide-react';
import { Book } from '../types';
import { LibraryStore } from '../services/library-store';
import { AuthService } from '../services/auth-adapter';
import { SITEMAP_CHUNK_SIZE } from '../services/sitemap-service';

interface Props {
  books: Book[];
  onBookUpdated: () => void;
  onOpenAddModal: () => void;
  onOpenBatchScraper: () => void;
  onOpenPseo: () => void;
  onExitAdmin: () => void;
}

export const SecretAdminView: React.FC<Props> = ({
  books,
  onBookUpdated,
  onOpenAddModal,
  onOpenBatchScraper,
  onOpenPseo,
  onExitAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [pdfInput, setPdfInput] = useState('');
  const [epubInput, setEpubInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const pdfCount = books.filter((b) => b.downloadPdfUrl).length;
  const epubCount = books.filter((b) => b.downloadEpubUrl).length;
  const sitemapChunks = Math.max(1, Math.ceil(books.length / SITEMAP_CHUNK_SIZE));

  const handleStartEdit = (b: Book) => {
    setEditingBookId(b.id);
    setPdfInput(b.downloadPdfUrl || '');
    setEpubInput(b.downloadEpubUrl || '');
    setSizeInput(b.fileSize || '');
    setIsSaved(false);
  };

  const handleSaveLinks = (id: string) => {
    LibraryStore.updateBook(id, {
      downloadPdfUrl: pdfInput.trim() || undefined,
      downloadEpubUrl: epubInput.trim() || undefined,
      fileSize: sizeInput.trim() || undefined,
    });
    setEditingBookId(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onBookUpdated();
  };

  const handleDeleteBook = (b: Book) => {
    if (window.confirm(`Delete "${b.title}" from the catalog?`)) {
      LibraryStore.deleteBook(b.id);
      onBookUpdated();
    }
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Clean Institutional Header: Semantic Icon, Primary H1 Title, Concise 1-Line Subtitle */}
      <header className="masthead" style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Shield size={34} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <h1 className="masthead-title" style={{ fontSize: 'clamp(34px, 5vw, 56px)', margin: 0, lineHeight: 1 }}>
              Catalog Administration
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn--sm" onClick={onExitAdmin}>
              <ArrowLeft size={14} /> Public Library
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                AuthService.logout();
                onExitAdmin();
              }}
            >
              <Lock size={14} /> Sign Out
            </button>
          </div>
        </div>
        <p className="masthead-stats" style={{ marginTop: '8px' }}>
          Manage bibliographic records, programmatic SEO templates, and partitioned XML sitemaps.
        </p>
      </header>

      {/* Primary KPI Tiles */}
      <div className="stat-tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', margin: '24px 0' }}>
        <div className="stat-tile">
          <span className="stat-tile-label">INDEXED VOLUMES</span>
          <span className="stat-tile-value" style={{ fontSize: '36px' }}>
            {books.length.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            {sitemapChunks} {sitemapChunks === 1 ? 'sitemap partition' : 'sitemap partitions'}
          </span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">PDF ARCHIVES</span>
          <span className="stat-tile-value" style={{ fontSize: '36px' }}>
            {pdfCount.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            {Math.round((pdfCount / Math.max(1, books.length)) * 100)}% catalog coverage
          </span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">EPUB EDITIONS</span>
          <span className="stat-tile-value" style={{ fontSize: '36px' }}>
            {epubCount.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Reflowable digital files</span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">TOTAL DOWNLOADS</span>
          <span className="stat-tile-value" style={{ fontSize: '36px' }}>
            {totalDownloads.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Recorded reader transfers</span>
        </div>
      </div>

      {/* Administrative Operations Toolbar */}
      <div
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--ink)',
          padding: '16px',
          boxShadow: 'var(--hard)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary" onClick={onOpenAddModal}>
            <Plus size={15} /> Add Volume
          </button>
          <button type="button" className="btn" onClick={onOpenBatchScraper}>
            <Database size={15} /> Batch Metadata Importer
          </button>
          <button type="button" className="btn" onClick={onOpenPseo}>
            <Globe size={15} /> pSEO &amp; Sitemap Manager
          </button>
        </div>

        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
          Active Sitemaps: <code>sitemap.xml</code> → <code>sitemap_1.xml</code>
          {sitemapChunks > 1 ? ` .. sitemap_${sitemapChunks}.xml` : ''}
        </div>
      </div>

      {isSaved && (
        <div
          style={{
            background: '#e8f5e9',
            border: '2px solid #2e7d32',
            color: '#1b5e20',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          Record updated.
        </div>
      )}

      {/* Search & Manage Table */}
      <div style={{ marginBottom: '14px', display: 'flex', gap: '10px' }}>
        <input
          type="search"
          className="search"
          placeholder="Search catalog by title, author, or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p className="empty-note">No records found.</p>
      ) : (
        <div className="ledger-wrap" style={{ border: '3px solid var(--ink)', boxShadow: 'var(--hard)' }}>
          <table className="ledger">
            <thead>
              <tr>
                <th>Title &amp; Author</th>
                <th>pSEO Slug</th>
                <th>PDF URL</th>
                <th>EPUB URL</th>
                <th>File Size</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.slice(0, 100).map((b) => {
                const isEditing = editingBookId === b.id;

                return (
                  <tr key={b.id}>
                    <td className="ledger-title" style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>{b.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{b.author}</div>
                    </td>

                    <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                      /books/{b.slug}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="url"
                          placeholder="https://.../book.pdf"
                          value={pdfInput}
                          onChange={(e) => setPdfInput(e.target.value)}
                          style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid var(--ink)' }}
                        />
                      ) : b.downloadPdfUrl ? (
                        <a
                          href={b.downloadPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11.5px' }}
                        >
                          Linked (PDF)
                        </a>
                      ) : (
                        <span style={{ color: 'var(--ink-soft)', fontSize: '11.5px' }}>None</span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="url"
                          placeholder="https://.../book.epub"
                          value={epubInput}
                          onChange={(e) => setEpubInput(e.target.value)}
                          style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid var(--ink)' }}
                        />
                      ) : b.downloadEpubUrl ? (
                        <a
                          href={b.downloadEpubUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#1a34d6', fontWeight: 700, fontSize: '11.5px' }}
                        >
                          Linked (EPUB)
                        </a>
                      ) : (
                        <span style={{ color: 'var(--ink-soft)', fontSize: '11.5px' }}>None</span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="1.5 MB"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          style={{ width: '70px', fontSize: '11px', padding: '4px', border: '1px solid var(--ink)' }}
                        />
                      ) : (
                        <span style={{ fontSize: '12px' }}>{b.fileSize || '—'}</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleSaveLinks(b.id)}
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            type="button"
                            className="btn btn--sm"
                            onClick={() => setEditingBookId(null)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn--sm"
                            onClick={() => handleStartEdit(b)}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => handleDeleteBook(b)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};