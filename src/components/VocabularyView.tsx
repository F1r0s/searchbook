import React, { useState } from 'react';
import { BookA } from 'lucide-react';
import { VocabularyWord } from '../types';
import { LibraryStore } from '../services/library-store';
import VocabCard from './VocabCard';
import { useI18n } from '../lib/i18n';

interface Props {
  vocabulary: VocabularyWord[];
  onVocabUpdated: () => void;
  onNavigateToBook: (slug: string) => void;
}

export const VocabularyView: React.FC<Props> = ({
  vocabulary,
  onVocabUpdated,
  onNavigateToBook,
}) => {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New word form
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newPos, setNewPos] = useState('noun');
  const [newDef, setNewDef] = useState('');
  const [newSentence, setNewSentence] = useState('');
  const [newBook, setNewBook] = useState('The Odyssey');

  const filteredWords = vocabulary.filter((w) => {
    if (filter === 'learning' && w.mastered) return false;
    if (filter === 'mastered' && !w.mastered) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.bookTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleMastered = (id: string) => {
    LibraryStore.toggleVocabularyMastered(id);
    onVocabUpdated();
  };

  const handleDeleteWord = (id: string) => {
    if (window.confirm('Remove this word from your vocabulary registry?')) {
      LibraryStore.deleteVocabulary(id);
      onVocabUpdated();
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDef.trim()) return;

    LibraryStore.addVocabulary({
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || `/${newWord.toLowerCase()}/`,
      partOfSpeech: newPos,
      definition: newDef.trim(),
      sampleSentence: newSentence.trim(),
      bookTitle: newBook.trim(),
      bookSlug: newBook.toLowerCase().replace(/\s+/g, '-'),
      mastered: false,
    });

    setNewWord('');
    setNewPhonetic('');
    setNewDef('');
    setNewSentence('');
    setShowAddModal(false);
    onVocabUpdated();
  };

  return (
    <div className="page" style={{ padding: '0' }}>
      {/* Clean Institutional Header: Semantic Icon + Primary H1 Title + Concise 1-Line Subtitle */}
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <BookA size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            {t('vocab.title')}
          </h1>
        </div>
        <p className="masthead-stats">
          {t('vocab.stats', {
            total: vocabulary.length,
            unit: vocabulary.length === 1 ? t('vocab.wordUnitSingle') : t('vocab.wordUnitPlural'),
            mastered: vocabulary.filter((w) => w.mastered).length,
          })}
        </p>
      </header>

      {/* Toolbar */}
      <div className="toolbar" style={{ margin: '20px 0 28px' }}>
        <div className="toolbar-row">
          <input
            type="search"
            className="search"
            placeholder={t('vocab.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setShowAddModal(true)}
          >
            {t('vocab.addWord')}
          </button>
        </div>

        <div className="toolbar-row toolbar-row--chips">
          {(
            [
              { key: 'all', label: t('vocab.all') },
              { key: 'learning', label: t('vocab.learning') },
              { key: 'mastered', label: t('vocab.mastered') },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              type="button"
              className={filter === s.key ? 'chip chip--active' : 'chip'}
              onClick={() => setFilter(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exact Bookplate Vocab Grid */}
      {filteredWords.length === 0 ? (
        <p className="empty-note">No records found.</p>
      ) : (
        <ul className="vocab-grid">
          {filteredWords.map((item) => (
            <VocabCard
              key={item.id}
              entry={item}
              onDelete={() => handleDeleteWord(item.id)}
              onToggleMastered={() => handleToggleMastered(item.id)}
              onNavigateToBook={onNavigateToBook}
            />
          ))}
        </ul>
      )}

      {/* Add Word Dialog */}
      {showAddModal && (
        <div className="overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <button
              type="button"
              className="dialog-close"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>

            <h2 className="detail-title" style={{ fontSize: '28px', marginBottom: '16px' }}>
              Add Word
            </h2>

            <form onSubmit={handleAddWord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                  <span>Word</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ephemeral"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                    <span>Phonetic</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /ɪˈfɛmərəl/"
                    value={newPhonetic}
                    onChange={(e) => setNewPhonetic(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                  />
                </div>
                <div>
                  <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                    <span>Part of Speech</span>
                  </label>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                  >
                    <option value="noun">noun</option>
                    <option value="adjective">adjective</option>
                    <option value="verb">verb</option>
                    <option value="adverb">adverb</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                  <span>Definition</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Definition from Wiktionary or book context..."
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                />
              </div>

              <div>
                <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                  <span>Sample Sentence</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Sentence where you encountered the word..."
                  value={newSentence}
                  onChange={(e) => setNewSentence(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                />
              </div>

              <div>
                <label className="field" style={{ display: 'block', marginBottom: '4px' }}>
                  <span>Book Source</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Odyssey"
                  value={newBook}
                  onChange={(e) => setNewBook(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '2px solid var(--line)', background: 'var(--paper)', font: 'inherit' }}
                />
              </div>

              <div className="dialog-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Save word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
