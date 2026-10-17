import React, { useState } from 'react';
import { Book } from '../types';
import { LibraryStore } from '../services/library-store';
import { AuthService } from '../services/auth-adapter';

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
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDownloads = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);
  const pdfCount = books.filter((b) => b.downloadPdfUrl).length;
  const epubCount = books.filter((b) => b.downloadEpubUrl).length;

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
    if (window.confirm(`Permanently remove "${b.title}" from the digital library?`)) {
      LibraryStore.deleteBook(b.id);
      onBookUpdated();
    }
  };

  return (
    <div className="page" style={{ padding: '0' }}>
      {/* Hidden Cockpit Masthead */}
      <div className="masthead" style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                letterSpacing: '0.12em',
                border: '1.5px solid var(--ink)',
              }}
            >
              SECRET GATEWAY
            </span>
            <span className="masthead-eyebrow" style={{ color: 'var(--ink)' }}>
              PATH: /secretadmin2026
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--sm"
              onClick={onExitAdmin}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              View Public Library →
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => {
                AuthService.logout();
                onExitAdmin();
              }}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              🔒 Lock Cockpit
            </button>
          </div>
        </div>

        <h1 className="masthead-title" style={{ fontSize: 'clamp(36px, 6vw, 68px)', margin: '8px 0 6px' }}>
          Curator Dashboard
        </h1>
        <p className="masthead-stats">
          Secret administration terminal. Hidden from crawlers and public indexers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="stat-tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', margin: '24px 0' }}>
        <div className="stat-tile">
          <span className="stat-tile-label">TOTAL VOLUMES</span>
          <span className="stat-value" style={{ fontSize: '36px', fontWeight: 900, display: 'block', margin: '6px 0' }}>
            {books.length}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Catalogue titles</span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">PDF DOWNLOADS READY</span>
          <span className="stat-value" style={{ fontSize: '36px', fontWeight: 900, display: 'block', margin: '6px 0', color: 'var(--accent)' }}>
            {pdfCount}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            {Math.round((pdfCount / Math.max(1, books.length)) * 100)}% coverage
          </span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">EPUB EDITIONS</span>
          <span className="stat-value" style={{ fontSize: '36px', fontWeight: 900, display: 'block', margin: '6px 0', color: '#1a34d6' }}>
            {epubCount}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Reflowable formats</span>
        </div>

        <div className="stat-tile">
          <span className="stat-tile-label">READER DOWNLOAD EVENTS</span>
          <span className="stat-value" style={{ fontSize: '36px', fontWeight: 900, display: 'block', margin: '6px 0' }}>
            {totalDownloads.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Direct hits</span>
        </div>
      </div>

      {/* Action Tools Row */}
      <div
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--ink)',
          padding: '16px',
          boxShadow: 'var(--hard)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary" onClick={onOpenAddModal}>
            + Add New Book
          </button>
          <button type="button" className="btn" onClick={onOpenBatchScraper}>
            ⚡ Ingest from Open Library
          </button>
          <button type="button" className="btn" onClick={onOpenPseo}>
            🌐 Configure Sitemaps &amp; pSEO
          </button>
        </div>

        {/* Modular Backend Connection Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--ink-soft)' }}>
          <span style={{ width: '8px', height: '8px', background: '#2e7d32', display: 'inline-block' }} />
          <span>Auth Adapter: <strong>Local Modular Mode</strong> (Ready for Backend REST/PostgreSQL)</span>
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
            fontWeight: 800,
            marginBottom: '16px',
          }}
        >
          ✓ Book download links successfully updated!
        </div>
      )}

      {/* Search & Manage Table */}
      <div style={{ marginBottom: '14px', display: 'flex', gap: '10px' }}>
        <input
          type="search"
          className="search"
          placeholder="Filter volumes to manage download links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="ledger-wrap" style={{ border: '3px solid var(--ink)', boxShadow: 'var(--hard)' }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Title &amp; Author</th>
              <th>PDF Link</th>
              <th>EPUB Link</th>
              <th>File Size</th>
              <th>Downloads</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((b) => {
              const isEditing = editingBookId === b.id;

              return (
                <tr key={b.id}>
                  <td className="ledger-title" style={{ maxWidth: '240px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{b.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>by {b.author}</div>
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
                        style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px' }}
                      >
                        ✓ Linked (PDF)
                      </a>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)', fontSize: '11px' }}>— No PDF</span>
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
                        style={{ color: '#1a34d6', fontWeight: 700, fontSize: '11px' }}
                      >
                        ✓ Linked (EPUB)
                      </a>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)', fontSize: '11px' }}>— No EPUB</span>
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

                  <td>
                    <span style={{ fontWeight: 700, fontSize: '12px' }}>
                      {(b.downloadCount || 0).toLocaleString()}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => handleSaveLinks(b.id)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={() => setEditingBookId(null)}
                          style={{ fontSize: '11px', padding: '3px 6px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={() => handleStartEdit(b)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Edit Files
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDeleteBook(b)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Delete
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
    </div>
  );
};