import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Book } from '../types';
import { LibraryStore } from '../services/library-store';
import StarRating from './StarRating';
import { useI18n } from '../lib/i18n';

interface Props {
  books: Book[];
}

export default function StatsView({ books }: Props) {
  const { t, formatNumber } = useI18n();
  const goal = LibraryStore.getReadingGoal();
  const finishedBooks = books.filter((b) => b.status === 'finished');
  const readingBooks = books.filter((b) => b.status === 'reading');
  const tbrBooks = books.filter((b) => b.status === 'want_to_read');

  const totalPages = finishedBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
  const rated = finishedBooks.filter((b) => b.rating > 0);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
      : 0;

  // Genre distribution
  const genreCounts: Record<string, number> = {};
  books.forEach((b) => {
    const g = b.genre || 'Uncategorized';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="page" style={{ padding: '0' }}>
      {/* Clean Institutional Header: Semantic Icon + Primary H1 Title + Concise 1-Line Subtitle */}
      <header className="masthead">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 8px' }}>
          <BarChart3 size={40} strokeWidth={2.2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <h1 className="masthead-title" style={{ margin: 0 }}>
            {t('stats.title')}
          </h1>
        </div>
        <p className="masthead-stats">
          {t('stats.statsSummary', {
            read: finishedBooks.length,
            reading: readingBooks.length,
            toRead: tbrBooks.length,
            pages: formatNumber(totalPages),
          })}
        </p>
      </header>

      {/* Primary KPI Tiles */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '24px 0' }}>
        <div className="stat-tile" style={{ background: 'var(--white)', border: '2px solid var(--ink)', padding: '20px', boxShadow: 'var(--hard)' }}>
          <span className="stat-tile-label">{t('stats.booksRead')}</span>
          <span className="stat-value" style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'block', margin: '8px 0' }}>
            {finishedBooks.length}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
            {t('stats.goal', { target: goal.targetBooks })}
          </span>
        </div>

        <div className="stat-tile" style={{ background: 'var(--white)', border: '2px solid var(--ink)', padding: '20px', boxShadow: 'var(--hard)' }}>
          <span className="stat-tile-label">{t('stats.pagesCompleted')}</span>
          <span className="stat-value" style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'block', margin: '8px 0' }}>
            {formatNumber(totalPages)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
            {t('stats.pagesDesc')}
          </span>
        </div>

        <div className="stat-tile" style={{ background: 'var(--white)', border: '2px solid var(--ink)', padding: '20px', boxShadow: 'var(--hard)' }}>
          <span className="stat-tile-label">{t('stats.avgRating')}</span>
          <span className="stat-value" style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'block', margin: '8px 0' }}>
            ★ {avgRating.toFixed(1)}
          </span>
          <div style={{ marginTop: '4px' }}>
            <StarRating value={avgRating} size="sm" />
          </div>
        </div>

        <div className="stat-tile" style={{ background: 'var(--white)', border: '2px solid var(--ink)', padding: '20px', boxShadow: 'var(--hard)' }}>
          <span className="stat-tile-label">{t('stats.challenge')}</span>
          <span className="stat-value" style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'block', margin: '8px 0' }}>
            {Math.round((finishedBooks.length / Math.max(1, goal.targetBooks)) * 100)}%
          </span>
          <div style={{ height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--ink)', marginTop: '8px' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--accent)',
                width: `${Math.min(100, (finishedBooks.length / Math.max(1, goal.targetBooks)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Genre Breakdown Ledger */}
      <div style={{ marginTop: '36px' }}>
        <h3 className="stat-tile-label" style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--ink)' }}>
          GENRE DISTRIBUTION
        </h3>
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Genre</th>
                <th>Count</th>
                <th>Share of Shelf</th>
              </tr>
            </thead>
            <tbody>
              {sortedGenres.map(([genre, count]) => {
                const percent = Math.round((count / books.length) * 100);
                return (
                  <tr key={genre}>
                    <td className="ledger-title">{genre}</td>
                    <td style={{ fontWeight: 700 }}>{count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, maxWidth: '160px', height: '8px', background: 'var(--paper-deep)', border: '1px solid var(--ink)' }}>
                          <div style={{ height: '100%', background: 'var(--accent)', width: `${percent}%` }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
