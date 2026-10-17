import React, { useState } from 'react';
import { motion } from 'motion/react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';

interface LandingViewProps {
  onOpenAdmin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAdmin }) => {
  const { t, locale, setLocale } = useI18n();
  // Interactive state for Demo 1: Adding books
  const [searchQuery, setSearchQuery] = useState('The Midnight Library');
  const [selectedBook, setSelectedBook] = useState<{
    title: string;
    author: string;
    year: number;
    color: number;
  }>({
    title: 'The Midnight Library',
    author: 'Matt Haig',
    year: 2020,
    color: 11,
  });
  const [isBookSaved, setIsBookSaved] = useState(false);

  // Interactive state for Demo 2: Notes
  const [noteSegments, setNoteSegments] = useState([
    { type: 'h2', text: 'The 1% rule' },
    { type: 'p', text: 'Habits are the compound interest of self-improvement.' },
    {
      type: 'quote',
      text: '“You do not rise to the level of your goals. You fall to the level of your systems.”',
    },
  ]);
  const [newNoteInput, setNewNoteInput] = useState('');

  // Interactive state for Demo 3: Stats
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Interactive state for Demo 4: Vocabulary
  const [vocabQuery, setVocabQuery] = useState('Hubris');
  const [savedVocab, setSavedVocab] = useState<
    Array<{ word: string; pos: string; def: string; from: string }>
  >([
    {
      word: 'Dystopian',
      pos: 'adjective',
      def: 'Relating to an imagined society where there is great suffering or injustice.',
      from: '1984',
    },
    {
      word: 'Sanguine',
      pos: 'adjective',
      def: 'Optimistic or positive, especially in an apparently bad or difficult situation.',
      from: 'Candide',
    },
  ]);
  const [currentWord, setCurrentWord] = useState<{
    word: string;
    phonetic: string;
    pos: string;
    def: string;
    example: string;
    from: string;
  }>({
    word: 'Hubris',
    phonetic: '/ˈhjuːbrɪs/',
    pos: 'noun',
    def: 'Excessive pride or self-confidence.',
    example: '“It was hubris to assume the harvest would never fail.”',
    from: 'Sapiens',
  });

  // Modal states for About and Contact
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const monthlyData = [
    { month: 'Jan', count: 3, pages: 980 },
    { month: 'Feb', count: 4, pages: 1240 },
    { month: 'Mar', count: 2, pages: 620 },
    { month: 'Apr', count: 5, pages: 1590 },
    { month: 'May', count: 3, pages: 890 },
    { month: 'Jun', count: 4, pages: 1110 },
    { month: 'Jul', count: 3, pages: 940 },
  ];

  const handleSaveWord = () => {
    if (!savedVocab.some((v) => v.word.toLowerCase() === currentWord.word.toLowerCase())) {
      setSavedVocab([
        {
          word: currentWord.word,
          pos: currentWord.pos,
          def: currentWord.def,
          from: currentWord.from,
        },
        ...savedVocab,
      ]);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root" style={{ background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* ── TOPBAR ───────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-inner">
          <div
            className="logo"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <LogoMark />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '-0.03em',
              }}
            >
              BookSearch
            </span>
          </div>

          <nav className="topnav" aria-label="Landing Navigation">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {t('nav.home')}
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'features';
              }}
            >
              {t('nav.features')}
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'about';
              }}
            >
              {t('nav.about')}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'contact';
              }}
            >
              {t('nav.contact')}
            </a>
          </nav>

          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', border: '2px solid var(--ink)' }}>
              <button
                type="button"
                onClick={() => setLocale('en')}
                style={{
                  border: 'none',
                  background: locale === 'en' ? 'var(--ink)' : '#fff',
                  color: locale === 'en' ? '#fff' : 'var(--ink)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('fr')}
                style={{
                  border: 'none',
                  borderLeft: '1px solid var(--ink)',
                  background: locale === 'fr' ? 'var(--ink)' : '#fff',
                  color: locale === 'fr' ? '#fff' : 'var(--ink)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                FR
              </button>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onOpenAdmin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Open Library →
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section className="hero" id="home" aria-label="BookSearch Digital Library Introduction">
        <div className="hero-inner" style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <LogoMark
              className=""
              style={{
                width: 'clamp(54px, 7vw, 76px)',
                height: 'clamp(54px, 7vw, 76px)',
                display: 'block',
                flexShrink: 0,
              }}
            />
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(44px, 7vw, 76px)',
                letterSpacing: '-0.04em',
                color: 'var(--ink)',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              BookSearch
            </motion.span>
          </motion.div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5.5vw, 64px)',
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              marginBottom: '32px',
            }}
          >
            {t('landing.heroTitle')}
          </h1>

          <div
            className="cta-row"
            style={{
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}
          >
            <button
              type="button"
              className="btn btn--gold btn--lg"
              onClick={onOpenAdmin}
              style={{ fontWeight: 700 }}
            >
              {t('landing.openLibrary')}
            </button>
            <button
              type="button"
              className="btn btn--lg"
              onClick={() => scrollToSection('features')}
            >
              {t('landing.exploreFeatures')}
            </button>
          </div>
        </div>
      </section>

      <div id="features"></div>

      {/* ── SECTION 01: ADDING BOOKS ─────────────────────────── */}
      <section className="sec sec--split">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">01</span> Adding books
            </div>
            <h2 className="sec-title">Search it, save it</h2>
          </div>
          <p>
            Find any book (along with its author, cover, and more) by quickly searching for it. Fully customisable for books you can’t find in our catalogue.
          </p>
          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn--sm"
              onClick={onOpenAdmin}
            >
              Try in Library →
            </button>
          </div>
        </div>

        <div className="sec-demo">
          <div className="win">
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot" />
                <span className="win-dot" />
                <span className="win-dot" />
              </div>
              <span className="win-url">booksearch.eu/library/new</span>
            </div>

            <div className="win-stage">
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '6px',
                  }}
                >
                  Search catalogue
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsBookSaved(false);
                    }}
                    placeholder="Search by title or author..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setIsBookSaved(true)}
                  >
                    {isBookSaved ? '✓ Added' : '+ Add book'}
                  </button>
                </div>
              </div>

              {/* Result card preview */}
              <div
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  padding: '14px',
                  boxShadow: 'var(--hard)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '76px',
                    background: '#1b3b6f',
                    color: '#fff',
                    border: '2px solid var(--ink)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '6px',
                    fontSize: '8px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  <span>{selectedBook.title}</span>
                  <span style={{ opacity: 0.8 }}>{selectedBook.author}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {selectedBook.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                    {selectedBook.author} ({selectedBook.year})
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        background: 'var(--paper-deep)',
                        border: '1px solid var(--ink)',
                      }}
                    >
                      Fiction
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        background: 'var(--accent)',
                        color: '#fff',
                      }}
                    >
                      Read
                    </span>
                  </div>
                </div>

                {isBookSaved && (
                  <span
                    style={{
                      background: 'var(--paper-deep)',
                      border: '1px solid var(--ink)',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}
                  >
                    Saved to Shelf
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02: NOTES ─────────────────────────────────── */}
      <section className="sec sec--split sec--flip">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">02</span> Notes
            </div>
            <h2 className="sec-title">Keep notes</h2>
          </div>
          <p>
            Every book gets its own notes page. Write headings, quotes and lists as you go, and paste pictures straight in.
          </p>
        </div>

        <div className="sec-demo">
          <div className="win">
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot" />
                <span className="win-dot" />
                <span className="win-dot" />
              </div>
              <span className="win-url">booksearch.eu/books/atomic-habits/notes</span>
            </div>

            <div className="win-stage">
              {/* Format Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  borderBottom: '2px solid var(--ink)',
                  paddingBottom: '8px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => {
                    setNoteSegments([
                      ...noteSegments,
                      { type: 'h2', text: 'Identity-based Habits' },
                    ]);
                  }}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => {
                    setNoteSegments([
                      ...noteSegments,
                      {
                        type: 'quote',
                        text: '“Every action you take is a vote for the type of person you wish to become.”',
                      },
                    ]);
                  }}
                >
                  Quote
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => {
                    setNoteSegments([
                      ...noteSegments,
                      {
                        type: 'p',
                        text: 'Focus on who you want to become, not just what you want to achieve.',
                      },
                    ]);
                  }}
                >
                  Paragraph
                </button>
              </div>

              {/* Live Rendered Content */}
              <div
                style={{
                  background: 'var(--white)',
                  border: '2px solid var(--ink)',
                  padding: '16px',
                  boxShadow: 'var(--hard)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {noteSegments.map((seg, idx) => {
                  if (seg.type === 'h2') {
                    return (
                      <h3
                        key={idx}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          borderBottom: '1px solid var(--hair)',
                          paddingBottom: '4px',
                          marginBottom: '8px',
                          marginTop: idx > 0 ? '12px' : 0,
                        }}
                      >
                        {seg.text}
                      </h3>
                    );
                  }
                  if (seg.type === 'quote') {
                    return (
                      <blockquote
                        key={idx}
                        style={{
                          borderLeft: '3px solid var(--accent)',
                          paddingLeft: '10px',
                          margin: '8px 0',
                          fontStyle: 'italic',
                          color: 'var(--ink)',
                          fontSize: '13px',
                        }}
                      >
                        {seg.text}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={idx} style={{ fontSize: '13px', lineHeight: 1.5, margin: '6px 0' }}>
                      {seg.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 03: STATISTICS ───────────────────────────── */}
      <section className="sec">
        <div className="sec-copy sec-copy--above" style={{ maxWidth: '800px', margin: '0 auto 32px auto', textAlign: 'center' }}>
          <div className="sec-head" style={{ justifyContent: 'center' }}>
            <div className="sec-kicker">
              <span className="sec-n">03</span> Statistics
            </div>
            <h2 className="sec-title">See your reading add up</h2>
          </div>
          <p>
            Books per year, pages, genres and ratings. Click any chart to see the books behind it.
          </p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="win">
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot" />
                <span className="win-dot" />
                <span className="win-dot" />
              </div>
              <span className="win-url">booksearch.eu/stats</span>
            </div>

            <div className="win-stage">
              {/* Stat Tiles */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Books read
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                    24
                  </div>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Pages read
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                    7,840
                  </div>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Avg. rating
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                    4.3★
                  </div>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Streak
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>
                    18 days
                  </div>
                </div>
              </div>

              {/* Monthly Interactive Chart Bar */}
              <div
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  padding: '16px',
                  boxShadow: 'var(--hard)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Monthly Reading Activity (2026)</span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    {hoveredMonth ? `Hovered: ${hoveredMonth}` : 'Hover bars for details'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '12px',
                    height: '110px',
                    borderBottom: '2px solid var(--ink)',
                    paddingBottom: '4px',
                  }}
                >
                  {monthlyData.map((d) => (
                    <div
                      key={d.month}
                      onMouseEnter={() => setHoveredMonth(`${d.month}: ${d.count} books (${d.pages} pages)`)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${d.count * 18}px`,
                          background: hoveredMonth?.startsWith(d.month) ? 'var(--ink)' : 'var(--accent)',
                          transition: 'background 0.2s',
                          border: '1.5px solid var(--ink)',
                        }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 04: VOCABULARY ───────────────────────────── */}
      <section className="sec sec--split">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">04</span> Vocabulary
            </div>
            <h2 className="sec-title">Expand your vocabulary</h2>
          </div>
          <p>
            Met a word you didn’t know? Look it up, keep the meaning you were after, and tag it with the book you found it in.
          </p>
          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn--sm"
              onClick={onOpenAdmin}
            >
              Browse Vocabulary →
            </button>
          </div>
        </div>

        <div className="sec-demo">
          <div className="win">
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot" />
                <span className="win-dot" />
                <span className="win-dot" />
              </div>
              <span className="win-url">booksearch.eu/vocabulary</span>
            </div>

            <div className="win-stage">
              {/* Word lookup view */}
              <div
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  padding: '14px',
                  boxShadow: 'var(--hard)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '22px',
                        margin: 0,
                      }}
                    >
                      {currentWord.word}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                      {currentWord.phonetic} • {currentWord.pos}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={handleSaveWord}
                  >
                    + Save word
                  </button>
                </div>

                <p style={{ fontSize: '13px', margin: '8px 0 4px', fontWeight: 600 }}>
                  {currentWord.def}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
                  {currentWord.example}
                </p>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginTop: '8px' }}>
                  FROM: {currentWord.from}
                </div>
              </div>

              {/* Saved words grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                {savedVocab.map((v) => (
                  <div
                    key={v.word}
                    style={{
                      border: '1.5px solid var(--ink)',
                      background: 'var(--paper-deep)',
                      padding: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '12px' }}>{v.word}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                      {v.def.slice(0, 40)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOPHON / FOOTER ─────────────────────────────────── */}
      <footer className="colophon" style={{ borderTop: '2px solid var(--line)', padding: '24px 28px', background: 'var(--paper-deep)' }}>
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px' }}>
            <strong style={{ fontFamily: 'var(--font-display)' }}>BookSearch</strong> — A private reading tracker.
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a
              href="#about"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              About
            </a>
            <a
              href="#contact"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Contact
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700 }}
            >
              Digital Library →
            </button>
          </div>
        </div>
      </footer>

      {/* ── ABOUT MODAL ─────────────────────────────────────── */}
      {showAboutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowAboutModal(false)}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '3px solid var(--ink)',
              boxShadow: 'var(--hard-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '24px' }}>
                About BookSearch
              </h2>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setShowAboutModal(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '14px' }}>
              <strong>BookSearch</strong> is a quiet, personal space for your reading life. No algorithmic feeds, no influencer clout, no advertisements, and no tracking.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '14px' }}>
              Keep every book you’ve read, are reading, or wish to read. Write markdown notes with picture attachments, preserve definitions for words you learn, and inspect your reading trends over the years.
            </p>
            <div style={{ borderTop: '2px solid var(--hair)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowAboutModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL ───────────────────────────────────── */}
      {showContactModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '3px solid var(--ink)',
              boxShadow: 'var(--hard-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '24px' }}>
                Get in touch
              </h2>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setShowContactModal(false)}
              >
                ✕
              </button>
            </div>

            {contactSubmitted ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Thank you!</h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>
                  Your message has been received. We appreciate your feedback and ideas.
                </p>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSubmitted(false);
                    setContactMessage('');
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (contactMessage.trim()) {
                    setContactSubmitted(true);
                  }
                }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="reader@example.com"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Message or Feature Request
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us what feature you'd love to see or ask a question..."
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowContactModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                  >
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
