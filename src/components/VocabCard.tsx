import React from 'react';
import { VocabularyWord } from '../types';

interface Props {
  entry: VocabularyWord;
  onDelete?: () => void;
  onToggleMastered?: () => void;
  onNavigateToBook?: (slug: string) => void;
}

export default function VocabCard({ entry, onDelete, onToggleMastered, onNavigateToBook }: Props) {
  const wiktionaryUrl = `https://en.wiktionary.org/wiki/${encodeURIComponent(
    entry.word.trim().replace(/ /g, '_')
  )}#English`;

  return (
    <li className="vocab-card" style={{ position: 'relative' }}>
      {onDelete && (
        <button
          type="button"
          className="vocab-delete"
          aria-label={`Remove ${entry.word}`}
          onClick={onDelete}
        >
          ✕
        </button>
      )}

      <div className="vocab-card-body">
        <div className="vocab-headword">
          <span className="vocab-word">{entry.word}</span>
          {entry.phonetic && <span className="lookup-phonetic">{entry.phonetic}</span>}
        </div>

        {entry.partOfSpeech && <span className="sense-pos">{entry.partOfSpeech}</span>}

        <p className="vocab-def">{entry.definition}</p>

        {entry.sampleSentence && (
          <p className="sense-example">“{entry.sampleSentence}”</p>
        )}

        <p className="vocab-meta" style={{ marginTop: 'auto', paddingTop: '10px' }}>
          from{' '}
          <button
            type="button"
            className="vocab-book-link"
            onClick={() => onNavigateToBook && onNavigateToBook(entry.bookSlug)}
            style={{ fontStyle: 'italic', textDecoration: 'underline' }}
          >
            {entry.bookTitle}
          </button>{' '}
          · {entry.dateAdded}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--hair)' }}>
        <button
          type="button"
          onClick={onToggleMastered}
          className={`btn btn--sm ${entry.mastered ? 'btn--primary' : ''}`}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          {entry.mastered ? '✓ Mastered' : 'Mark mastered'}
        </button>

        <a
          className="vocab-more"
          href={wiktionaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px' }}
        >
          Wiktionary ↗
        </a>
      </div>
    </li>
  );
}
