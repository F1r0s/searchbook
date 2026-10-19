import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';
import { SimulatedCursor, ScriptStep } from './SimulatedCursor';

interface LandingViewProps {
  onOpenAdmin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAdmin }) => {
  const { t, locale, setLocale } = useI18n();
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);

  // Interactive state for Demo 1: Search & Download Simulator
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingAction, setDownloadingAction] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const DEMO_CATALOG = [
    {
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'Dystopian',
      pdfSize: '1.4 MB',
      epubSize: '820 KB',
      pages: 328,
      bg: '#111111',
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      year: 2018,
      genre: 'Self-Help',
      pdfSize: '2.1 MB',
      epubSize: '1.1 MB',
      pages: 320,
      bg: '#ff8a00',
    },
    {
      title: 'The Midnight Library',
      author: 'Matt Haig',
      year: 2020,
      genre: 'Fiction',
      pdfSize: '1.8 MB',
      epubSize: '950 KB',
      pages: 304,
      bg: '#1a34d6',
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      year: 2014,
      genre: 'History',
      pdfSize: '3.4 MB',
      epubSize: '1.9 MB',
      pages: 443,
      bg: '#00994d',
    },
  ];

  const filteredDemoBooks = DEMO_CATALOG.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateDownload = (title: string, format: 'PDF' | 'EPUB') => {
    const key = `${title}-${format}`;
    setDownloadingAction(key);
    setDownloadProgress(25);

    setTimeout(() => setDownloadProgress(65), 250);
    setTimeout(() => setDownloadProgress(100), 550);
    setTimeout(() => {
      setDownloadingAction(null);
      setDownloadProgress(0);
      setDownloadSuccessMessage(`✓ ${title} downloaded as ${format} & saved to your local library!`);
      setTimeout(() => setDownloadSuccessMessage(null), 3500);
    }, 850);
  };

  // Interactive state for Demo 2: Notes & Paint Highlighters
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [activeTextColor, setActiveTextColor] = useState('#111111');
  const [notesSaveStatus, setNotesSaveStatus] = useState<string | null>(null);

  const initialDemoNotes = useMemo(() => [
    {
      type: 'h3',
      text: 'The 1% Compounding Rule',
      color: '#111111',
      highlight: 'transparent',
    },
    {
      type: 'p',
      text: 'Habits are the compound interest of self-improvement. Getting 1% better every day counts for enormous gains over time.',
      color: '#111111',
      highlight: '#fef08a',
    },
  ], []);

  const [noteItems, setNoteItems] = useState(initialDemoNotes);

  // Demo 1 Automated Timeline
  const demo1Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 700 },
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 500,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 250 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: '1984',
      speedMs: 95,
      onChar: (text) => setSearchQuery(text),
    },
    { type: 'wait', ms: 550 },
    {
      type: 'move',
      target: '[data-tour="demo1-pdf-btn-1984"]',
      shape: 'pointer',
      duration: 500,
      hoverSelector: '[data-tour="demo1-pdf-btn-1984"]',
    },
    { type: 'wait', ms: 280 },
    {
      type: 'click',
      target: '[data-tour="demo1-pdf-btn-1984"]',
      holdMs: 150,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('1984', 'PDF');
      },
    },
    { type: 'wait', ms: 1400 },
    {
      type: 'move',
      target: '[data-tour="demo1-storage-badge"]',
      shape: 'arrow',
      duration: 550,
    },
    { type: 'wait', ms: 2400 },
  ], []);

  const handleDemo1Reset = useCallback(() => {
    setSearchQuery('');
    setDownloadingAction(null);
    setDownloadProgress(0);
    setDownloadSuccessMessage(null);
  }, []);

  // Demo 2 Automated Timeline
  const demo2Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 700 },
    {
      type: 'move',
      target: '[data-tour="marker-pink"]',
      shape: 'pointer',
      duration: 480,
      hoverSelector: '[data-tour="marker-pink"]',
    },
    { type: 'wait', ms: 220 },
    {
      type: 'click',
      target: '[data-tour="marker-pink"]',
      holdMs: 140,
    },
    {
      type: 'action',
      run: () => {
        setActiveHighlightColor('#fbcfe8');
      },
    },
    { type: 'wait', ms: 300 },
    {
      type: 'move',
      target: '[data-tour="ink-vermilion"]',
      shape: 'pointer',
      duration: 450,
      hoverSelector: '[data-tour="ink-vermilion"]',
    },
    { type: 'wait', ms: 200 },
    {
      type: 'click',
      target: '[data-tour="ink-vermilion"]',
      holdMs: 140,
    },
    {
      type: 'action',
      run: () => {
        setActiveTextColor('#ff3b1f');
      },
    },
    { type: 'wait', ms: 300 },
    {
      type: 'move',
      target: '[data-tour="tool-quote"]',
      shape: 'pointer',
      duration: 480,
      hoverSelector: '[data-tour="tool-quote"]',
    },
    { type: 'wait', ms: 240 },
    {
      type: 'click',
      target: '[data-tour="tool-quote"]',
      holdMs: 150,
    },
    {
      type: 'action',
      run: () => {
        handleAddNoteSnippet('quote', '“You do not rise to the level of your goals. You fall to the level of your systems.”');
      },
    },
    { type: 'wait', ms: 400 },
    {
      type: 'move',
      target: '[data-tour="notes-canvas"]',
      shape: 'arrow',
      duration: 520,
    },
    { type: 'wait', ms: 2500 },
  ], []);

  const handleDemo2Reset = useCallback(() => {
    setNoteItems(initialDemoNotes);
    setActiveHighlightColor('#fef08a');
    setActiveTextColor('#111111');
    setNotesSaveStatus(null);
  }, [initialDemoNotes]);

  // Interactive state for Demo 3: Stats & Reading Corpus
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('Feb');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Demo 3 Automated Timeline
  const demo3Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 700 },
    {
      type: 'move',
      target: '[data-tour="stat-tile-volumes"]',
      shape: 'arrow',
      duration: 450,
      hoverSelector: '[data-tour="stat-tile-volumes"]',
    },
    { type: 'wait', ms: 300 },
    {
      type: 'move',
      target: '[data-tour="month-bar-Feb"]',
      shape: 'pointer',
      duration: 400,
      hoverSelector: '[data-tour="month-bar-Feb"]',
    },
    {
      type: 'action',
      run: () => {
        setHoveredMonth('Feb: 4 volumes · 1,240 pages');
      },
    },
    { type: 'wait', ms: 380 },
    {
      type: 'move',
      target: '[data-tour="month-bar-Mar"]',
      shape: 'pointer',
      duration: 350,
      hoverSelector: '[data-tour="month-bar-Mar"]',
    },
    {
      type: 'action',
      run: () => {
        setHoveredMonth('Mar: 2 volumes · 620 pages');
      },
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="month-bar-Apr"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="month-bar-Apr"]',
    },
    {
      type: 'action',
      run: () => {
        setHoveredMonth('Apr: 5 volumes · 1,590 pages');
      },
    },
    { type: 'wait', ms: 260 },
    {
      type: 'click',
      target: '[data-tour="month-bar-Apr"]',
      holdMs: 150,
    },
    {
      type: 'action',
      run: () => {
        setSelectedMonthKey('Apr');
        setHoveredMonth(null);
      },
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo3-detail-box"]',
      shape: 'arrow',
      duration: 500,
    },
    { type: 'wait', ms: 2400 },
  ], []);

  const handleDemo3Reset = useCallback(() => {
    setSelectedMonthKey('Feb');
    setHoveredMonth(null);
  }, []);

  // Interactive state for Demo 4: Lexical Registry
  const [activeVocabWord, setActiveVocabWord] = useState('Hubris');

  const initialSavedVocab = useMemo(() => [
    {
      word: 'Dystopian',
      pos: 'adjective',
      def: 'Relating to an imagined society where there is great suffering or injustice.',
      from: '1984',
    },
    {
      word: 'Sanguine',
      pos: 'adjective',
      def: 'Optimistic or positive in difficult situations.',
      from: 'Candide',
    },
  ], []);

  const [savedVocabList, setSavedVocabList] = useState(initialSavedVocab);

  // Demo 4 Automated Timeline
  const demo4Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 700 },
    {
      type: 'move',
      target: '[data-tour="vocab-chip-Apotheosis"]',
      shape: 'pointer',
      duration: 460,
      hoverSelector: '[data-tour="vocab-chip-Apotheosis"]',
    },
    { type: 'wait', ms: 240 },
    {
      type: 'click',
      target: '[data-tour="vocab-chip-Apotheosis"]',
      holdMs: 140,
    },
    {
      type: 'action',
      run: () => {
        setActiveVocabWord('Apotheosis');
      },
    },
    { type: 'wait', ms: 400 },
    {
      type: 'move',
      target: '[data-tour="vocab-save-btn"]',
      shape: 'pointer',
      duration: 460,
      hoverSelector: '[data-tour="vocab-save-btn"]',
    },
    { type: 'wait', ms: 250 },
    {
      type: 'click',
      target: '[data-tour="vocab-save-btn"]',
      holdMs: 150,
    },
    {
      type: 'action',
      run: () => {
        setSavedVocabList((prev) => {
          if (!prev.some((v) => v.word.toLowerCase() === 'apotheosis')) {
            return [
              {
                word: 'Apotheosis',
                pos: 'noun',
                def: 'The highest point in the development of something; culmination or deification.',
                from: 'Where the Crawdads Sing',
              },
              ...prev,
            ];
          }
          return prev;
        });
      },
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="vocab-saved-grid"]',
      shape: 'arrow',
      duration: 500,
    },
    { type: 'wait', ms: 2500 },
  ], []);

  const handleDemo4Reset = useCallback(() => {
    setActiveVocabWord('Hubris');
    setSavedVocabList(initialSavedVocab);
  }, [initialSavedVocab]);
  const VOCAB_PRESETS: Record<
    string,
    { word: string; phonetic: string; pos: string; def: string; example: string; from: string }
  > = {
    Hubris: {
      word: 'Hubris',
      phonetic: '/ˈhjuːbrɪs/',
      pos: 'noun',
      def: 'Excessive pride, presumption, or dangerous self-confidence.',
      example: '“It was sheer hubris to assume the empire would never collapse under its own weight.”',
      from: 'Sapiens',
    },
    Apotheosis: {
      word: 'Apotheosis',
      phonetic: '/əˌpɒθiˈoʊsɪs/',
      pos: 'noun',
      def: 'The highest point in the development of something; culmination or deification.',
      example: '“The final chapter represented the apotheosis of his narrative ambition.”',
      from: 'Where the Crawdads Sing',
    },
    Inchoate: {
      word: 'Inchoate',
      phonetic: '/ɪnˈkoʊɪt/',
      pos: 'adjective',
      def: 'Just begun and so not fully formed or developed; rudimentary.',
      example: '“An inchoate longing that she could neither articulate nor suppress.”',
      from: 'There Are Rivers in the Sky',
    },
    Ephemeral: {
      word: 'Ephemeral',
      phonetic: '/ɪˈfɛmərəl/',
      pos: 'adjective',
      def: 'Lasting for a very short time; transitory; fleeting.',
      example: '“The ephemeral beauty of morning frost against weathered binding cloth.”',
      from: 'The Midnight Library',
    },
  };

  const currentWord = VOCAB_PRESETS[activeVocabWord] || VOCAB_PRESETS.Hubris;

  const handleAddNoteSnippet = (type: 'p' | 'quote' | 'h3', text: string) => {
    setNoteItems([
      ...noteItems,
      {
        type,
        text,
        color: activeTextColor,
        highlight: activeHighlightColor,
      },
    ]);
    setNotesSaveStatus('Auto-saved to device');
    setTimeout(() => setNotesSaveStatus(null), 2500);
  };

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
    if (!savedVocabList.some((v) => v.word.toLowerCase() === currentWord.word.toLowerCase())) {
      setSavedVocabList([
        {
          word: currentWord.word,
          pos: currentWord.pos,
          def: currentWord.def,
          from: currentWord.from,
        },
        ...savedVocabList,
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
              Searchbook
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
              href="#library"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdmin();
              }}
              style={{ fontWeight: 800 }}
            >
              {t('nav.library')}
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              {t('nav.features')}
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                setShowAboutModal(true);
              }}
            >
              {t('nav.about')}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setShowContactModal(true);
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
        <div className="hero-inner" style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', padding: '16px 0' }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <LogoMark
              style={{
                width: 'clamp(36px, 4vw, 44px)',
                height: 'clamp(36px, 4vw, 44px)',
                display: 'block',
                flexShrink: 0,
              }}
            />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(28px, 4vw, 42px)',
                letterSpacing: '-0.04em',
                color: 'var(--ink)',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              Searchbook
            </motion.span>
          </motion.div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3.4vw, 40px)',
              lineHeight: 1.2,
              letterSpacing: '-0.035em',
              marginBottom: '14px',
              maxWidth: '800px',
              margin: '0 auto 14px',
            }}
          >
            {t('landing.heroTitle')}
          </h1>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.2vw, 16.5px)',
              color: 'var(--ink-soft)',
              maxWidth: '640px',
              margin: '0 auto 24px',
              lineHeight: 1.65,
            }}
          >
            {t('landing.heroSub')}
          </p>

          {/* Zero-Account & Local Storage Brutalist Trust Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '26px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '5px 11px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              🔒 {t('landing.badgeNoAccount')}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '5px 11px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: 'var(--accent)',
              }}
            >
              💾 {t('landing.badgeLocalSave')}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '5px 11px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              📥 {t('landing.badgeDownloads')}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffd400',
                border: '1.5px solid var(--ink)',
                boxShadow: 'var(--hard)',
                padding: '5px 11px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              🌐 {t('landing.badgeOpen')}
            </span>
          </div>

          <div
            className="cta-row"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '6px',
            }}
          >
            <button
              type="button"
              className="btn btn--gold btn--lg"
              onClick={onOpenAdmin}
              style={{ fontWeight: 800, padding: '12px 22px', fontSize: '13.5px' }}
            >
              📖 {t('landing.openLibrary')} →
            </button>
            <button
              type="button"
              className="btn btn--lg"
              onClick={() => scrollToSection('features')}
              style={{ fontWeight: 700, padding: '12px 22px', fontSize: '13.5px' }}
            >
              {t('landing.exploreFeatures')}
            </button>
          </div>
        </div>
      </section>

      <div id="features"></div>

      {/* ── SECTION 01: SEARCH & DOWNLOAD SIMULATOR ─────────────────── */}
      <section className="sec sec--split">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">01</span> {t('landing.sec1Kicker')}
            </div>
            <h2 className="sec-title">{t('landing.sec1Title')}</h2>
          </div>
          <p>{t('landing.sec1Desc')}</p>
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onOpenAdmin}
            >
              Open Digital Library →
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
              <span className="win-url">searchbook.pages.dev/library</span>
            </div>

            <div className="win-stage" ref={stage1Ref}>
              <SimulatedCursor
                containerRef={stage1Ref}
                steps={demo1Steps}
                onLoopReset={handleDemo1Reset}
              />
              {/* Interactive Search Bar & Suggestions */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--accent)',
                    }}
                  >
                    Instant Catalogue &amp; E-Book Resolver
                  </label>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>
                    Auto-saved locally
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    data-tour="demo1-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, or genre..."
                    style={{ flex: 1, padding: '8px 12px', fontSize: '14px' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => setSearchQuery('')}
                      style={{ fontSize: '11px' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Suggestion Pills */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['1984', 'Atomic Habits', 'The Midnight Library', 'Sapiens'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setSearchQuery(suggestion)}
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        border: '1.5px solid var(--ink)',
                        background: searchQuery === suggestion ? 'var(--ink)' : '#fff',
                        color: searchQuery === suggestion ? '#fff' : 'var(--ink)',
                        padding: '2px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Toast */}
              {downloadSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: '#e8f5e9',
                    border: '2px solid #2e7d32',
                    color: '#1b5e20',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    marginBottom: '12px',
                  }}
                >
                  {downloadSuccessMessage}
                </motion.div>
              )}

              {/* Animated Interactive Results Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredDemoBooks.map((book) => {
                  const isDownloadingPdf = downloadingAction === `${book.title}-PDF`;
                  const isDownloadingEpub = downloadingAction === `${book.title}-EPUB`;

                  return (
                    <motion.div
                      key={book.title}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        border: '2px solid var(--ink)',
                        background: '#ffffff',
                        padding: '12px 14px',
                        boxShadow: 'var(--hard)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '58px',
                            background: book.bg,
                            color: '#fff',
                            border: '1.5px solid var(--ink)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '4px',
                            fontSize: '7px',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</span>
                          <span style={{ opacity: 0.75 }}>{book.year}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                            <h4
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '16px',
                                fontWeight: 900,
                                margin: 0,
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {book.title}
                            </h4>
                            <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                              by {book.author} · {book.pages} pp
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                border: '1px solid var(--ink)',
                                padding: '1px 5px',
                                background: 'var(--paper-deep)',
                              }}
                            >
                              {book.genre}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--ink-soft)' }}>
                              Formats ready: PDF ({book.pdfSize}) · EPUB ({book.epubSize})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Download Progress Bar if active */}
                      {(isDownloadingPdf || isDownloadingEpub) && (
                        <div style={{ width: '100%', height: '6px', background: 'var(--paper-deep)', border: '1px solid var(--ink)', marginTop: '4px' }}>
                          <div
                            style={{
                              height: '100%',
                              background: 'var(--accent)',
                              width: `${downloadProgress}%`,
                              transition: 'width 0.2s ease',
                            }}
                          />
                        </div>
                      )}

                      {/* Interactive Format Triggers */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderTop: '1px solid var(--hair)',
                          paddingTop: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          data-tour={`demo1-pdf-btn-${book.title}`}
                          onClick={() => handleSimulateDownload(book.title, 'PDF')}
                          disabled={isDownloadingPdf}
                          className="btn btn--sm"
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            fontWeight: 800,
                            background: isDownloadingPdf ? 'var(--accent)' : '#fff',
                            color: isDownloadingPdf ? '#fff' : 'var(--ink)',
                          }}
                        >
                          {isDownloadingPdf ? '⬇ Downloading PDF...' : `⬇ Download PDF (${book.pdfSize})`}
                        </button>

                        <button
                          type="button"
                          data-tour={`demo1-epub-btn-${book.title}`}
                          onClick={() => handleSimulateDownload(book.title, 'EPUB')}
                          disabled={isDownloadingEpub}
                          className="btn btn--sm"
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            fontWeight: 800,
                            background: isDownloadingEpub ? '#1a34d6' : '#fff',
                            color: isDownloadingEpub ? '#fff' : '#1a34d6',
                            borderColor: '#1a34d6',
                          }}
                        >
                          {isDownloadingEpub ? '⬇ Downloading EPUB...' : `⬇ Download EPUB (${book.epubSize})`}
                        </button>

                        <button
                          type="button"
                          onClick={onOpenAdmin}
                          className="btn btn--sm"
                          style={{ fontSize: '11px', padding: '3px 8px', marginLeft: 'auto' }}
                        >
                          📖 Read Online ↗
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Local Storage Automatic Persistence Confirmation */}
              <div
                style={{
                  marginTop: '14px',
                  background: 'var(--paper-deep)',
                  border: '2px solid var(--ink)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}
              >
                <span>💾</span>
                <span>
                  <strong>Zero Sign-In Required:</strong> All reading progress, favorites, and downloaded books are saved automatically in your browser's local database.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02: WORD & PAINT NOTES STUDIO ─────────────────── */}
      <section className="sec sec--split sec--flip">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">02</span> {t('landing.sec2Kicker')}
            </div>
            <h2 className="sec-title">{t('landing.sec2Title')}</h2>
          </div>
          <p>{t('landing.sec2Desc')}</p>
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onOpenAdmin}
            >
              Open Notes Studio →
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
              <span className="win-url">searchbook.pages.dev/books/atomic-habits/notes</span>
            </div>

            <div className="win-stage" ref={stage2Ref}>
              <SimulatedCursor
                containerRef={stage2Ref}
                steps={demo2Steps}
                onLoopReset={handleDemo2Reset}
              />
              {/* Word & Paint Formatting Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '2px solid var(--ink)',
                  paddingBottom: '8px',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Structure buttons */}
                <div style={{ display: 'inline-flex', border: '1.5px solid var(--ink)' }}>
                  <button
                    type="button"
                    data-tour="tool-h3"
                    className="btn btn--sm"
                    onClick={() => handleAddNoteSnippet('h3', 'Identity-Based Habits')}
                    style={{ padding: '3px 7px', fontSize: '10.5px', boxShadow: 'none' }}
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    data-tour="tool-quote"
                    className="btn btn--sm"
                    onClick={() => handleAddNoteSnippet('quote', '“Every action you take is a vote for the person you wish to become.”')}
                    style={{ padding: '3px 7px', fontSize: '10.5px', boxShadow: 'none', borderLeft: '1px solid var(--ink)' }}
                  >
                    “ Quote
                  </button>
                  <button
                    type="button"
                    data-tour="tool-note"
                    className="btn btn--sm"
                    onClick={() => handleAddNoteSnippet('p', 'Four Laws: Make it obvious, attractive, easy, and satisfying.')}
                    style={{ padding: '3px 7px', fontSize: '10.5px', boxShadow: 'none', borderLeft: '1px solid var(--ink)' }}
                  >
                    + Note
                  </button>
                </div>

                {/* Highlighter Paint Swatches */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink-soft)' }}>
                    Marker:
                  </span>
                  {[
                    { color: '#fef08a', name: 'Yellow' },
                    { color: '#fbcfe8', name: 'Pink' },
                    { color: '#bbf7d0', name: 'Mint' },
                    { color: '#bae6fd', name: 'Cyan' },
                    { color: 'transparent', name: 'None' },
                  ].map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      data-tour={`marker-${m.name.toLowerCase()}`}
                      onClick={() => setActiveHighlightColor(m.color)}
                      style={{
                        width: '18px',
                        height: '18px',
                        background: m.color === 'transparent' ? '#fff' : m.color,
                        border: activeHighlightColor === m.color ? '2px solid var(--accent)' : '1px solid var(--ink)',
                        cursor: 'pointer',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={`Marker: ${m.name}`}
                    >
                      {m.color === 'transparent' ? '✕' : ''}
                    </button>
                  ))}
                </div>

                {/* Text Color Swatches */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink-soft)' }}>
                    Ink:
                  </span>
                  {[
                    { color: '#111111', name: 'Black' },
                    { color: '#ff3b1f', name: 'Vermilion' },
                    { color: '#1a34d6', name: 'Blue' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      data-tour={`ink-${c.name.toLowerCase()}`}
                      onClick={() => setActiveTextColor(c.color)}
                      style={{
                        width: '18px',
                        height: '18px',
                        background: c.color,
                        border: activeTextColor === c.color ? '2px solid var(--accent)' : '1px solid var(--ink)',
                        cursor: 'pointer',
                      }}
                      title={`Text Ink: ${c.name}`}
                    />
                  ))}
                </div>

                {notesSaveStatus && (
                  <span style={{ marginLeft: 'auto', fontSize: '10.5px', fontWeight: 800, color: 'var(--accent)' }}>
                    ✓ {notesSaveStatus}
                  </span>
                )}
              </div>

              {/* Clean White Notes Canvas */}
              <div
                data-tour="notes-canvas"
                style={{
                  background: '#ffffff',
                  border: '2px solid var(--ink)',
                  padding: '16px',
                  boxShadow: 'var(--hard)',
                  maxHeight: '230px',
                  overflowY: 'auto',
                }}
              >
                {noteItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ marginBottom: '10px' }}
                  >
                    {item.type === 'h3' ? (
                      <h4
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '17px',
                          fontWeight: 900,
                          margin: '0 0 4px',
                          color: item.color,
                          background: item.highlight !== 'transparent' ? item.highlight : undefined,
                          padding: item.highlight !== 'transparent' ? '2px 4px' : undefined,
                          display: 'inline-block',
                        }}
                      >
                        {item.text}
                      </h4>
                    ) : item.type === 'quote' ? (
                      <blockquote
                        style={{
                          borderLeft: '4px solid var(--accent)',
                          padding: '6px 12px',
                          margin: '6px 0',
                          fontStyle: 'italic',
                          color: item.color,
                          background: item.highlight !== 'transparent' ? item.highlight : 'var(--paper-deep)',
                          fontSize: '13.5px',
                        }}
                      >
                        {item.text}
                      </blockquote>
                    ) : (
                      <p
                        style={{
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          margin: 0,
                          color: item.color,
                          background: item.highlight !== 'transparent' ? item.highlight : undefined,
                          padding: item.highlight !== 'transparent' ? '1px 4px' : undefined,
                          display: 'inline',
                        }}
                      >
                        {item.text}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Automatic Local Storage Notice */}
              <div
                style={{
                  marginTop: '12px',
                  background: 'var(--paper-deep)',
                  border: '1.5px solid var(--ink)',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>💾 Synced locally without sign-in</span>
                <span style={{ color: 'var(--ink-soft)' }}>Markdown & Paint Canvas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 03: ANIMATED READING CORPUS & STATS ─────────────── */}
      <section className="sec">
        <div className="sec-copy sec-copy--above" style={{ maxWidth: '800px', margin: '0 auto 32px auto', textAlign: 'center' }}>
          <div className="sec-head" style={{ justifyContent: 'center' }}>
            <div className="sec-kicker">
              <span className="sec-n">03</span> {t('landing.sec3Kicker')}
            </div>
            <h2 className="sec-title">{t('landing.sec3Title')}</h2>
          </div>
          <p>{t('landing.sec3Desc')}</p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="win">
            <div className="win-bar">
              <div className="win-dots">
                <span className="win-dot" />
                <span className="win-dot" />
                <span className="win-dot" />
              </div>
              <span className="win-url">searchbook.pages.dev/stats</span>
            </div>

            <div className="win-stage" ref={stage3Ref}>
              <SimulatedCursor
                containerRef={stage3Ref}
                steps={demo3Steps}
                onLoopReset={handleDemo3Reset}
              />
              {/* Stat Tiles with motion */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  data-tour="stat-tile-volumes"
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Volumes Read
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900 }}>
                    24
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                    Goal: 24 (100%)
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pages Read
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900 }}>
                    7,840
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                    ~326 pages/vol
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Avg Rating
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900 }}>
                    ★ 4.6
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                    Rated reads
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Reading Streak
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>
                    18 days
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                    Active Daily
                  </span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px' }}>
                    Monthly Reading Velocity (Click bars to inspect)
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent)' }}>
                    {hoveredMonth || `Selected: ${selectedMonthKey} (Click any month)`}
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
                  {monthlyData.map((d) => {
                    const isSelected = selectedMonthKey === d.month;

                    return (
                      <div
                        key={d.month}
                        data-tour={`month-bar-${d.month}`}
                        onClick={() => setSelectedMonthKey(d.month)}
                        onMouseEnter={() => setHoveredMonth(`${d.month}: ${d.count} volumes · ${d.pages} pages`)}
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
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${d.count * 18}px` }}
                          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                          style={{
                            width: '100%',
                            background: isSelected ? 'var(--ink)' : 'var(--accent)',
                            border: '1.5px solid var(--ink)',
                            boxShadow: isSelected ? '2px 2px 0 var(--accent)' : 'none',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: isSelected ? 900 : 700,
                            color: isSelected ? 'var(--accent)' : 'var(--ink)',
                          }}
                        >
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Month Volume Detail */}
                <div
                  data-tour="demo3-detail-box"
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'var(--paper-deep)',
                    border: '1.5px solid var(--ink)',
                    fontSize: '11.5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    <strong>{selectedMonthKey} 2026:</strong> Finished volumes logged to shelf.
                  </span>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={onOpenAdmin}
                    style={{ fontSize: '10.5px', padding: '2px 8px' }}
                  >
                    View in Full Statistics →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 04: INTERACTIVE LEXICAL REGISTRY ───────────────── */}
      <section className="sec sec--split">
        <div className="sec-copy">
          <div className="sec-head">
            <div className="sec-kicker">
              <span className="sec-n">04</span> {t('landing.sec4Kicker')}
            </div>
            <h2 className="sec-title">{t('landing.sec4Title')}</h2>
          </div>
          <p>{t('landing.sec4Desc')}</p>
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onOpenAdmin}
            >
              Browse Vocabulary Registry →
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
              <span className="win-url">searchbook.pages.dev/vocabulary</span>
            </div>

            <div className="win-stage" ref={stage4Ref}>
              <SimulatedCursor
                containerRef={stage4Ref}
                steps={demo4Steps}
                onLoopReset={handleDemo4Reset}
              />
              {/* Word Selector Quick Switcher */}
              <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.keys(VOCAB_PRESETS).map((wordKey) => (
                  <button
                    key={wordKey}
                    type="button"
                    data-tour={`vocab-chip-${wordKey}`}
                    onClick={() => setActiveVocabWord(wordKey)}
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      border: '1.5px solid var(--ink)',
                      background: activeVocabWord === wordKey ? 'var(--ink)' : '#fff',
                      color: activeVocabWord === wordKey ? '#fff' : 'var(--ink)',
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {wordKey}
                  </button>
                ))}
              </div>

              {/* Word lookup view with Animated Transition */}
              <motion.div
                key={currentWord.word}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  padding: '14px',
                  boxShadow: 'var(--hard)',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '22px',
                        fontWeight: 900,
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
                    data-tour="vocab-save-btn"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      if (!savedVocabList.some((v) => v.word === currentWord.word)) {
                        setSavedVocabList([
                          {
                            word: currentWord.word,
                            pos: currentWord.pos,
                            def: currentWord.def,
                            from: currentWord.from,
                          },
                          ...savedVocabList,
                        ]);
                      }
                    }}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    + Save Word
                  </button>
                </div>

                <p style={{ fontSize: '13.5px', margin: '8px 0 4px', fontWeight: 600 }}>
                  {currentWord.def}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0, fontStyle: 'italic' }}>
                  {currentWord.example}
                </p>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, marginTop: '8px' }}>
                  SOURCE VOLUME: {currentWord.from}
                </div>
              </motion.div>

              {/* Saved words grid */}
              <div
                data-tour="vocab-saved-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}
              >
                {savedVocabList.map((v) => (
                  <motion.div
                    key={v.word}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      border: '1.5px solid var(--ink)',
                      background: 'var(--paper-deep)',
                      padding: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '12px' }}>{v.word}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.def}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Automatic Local Storage Notice */}
              <div
                style={{
                  marginTop: '12px',
                  background: 'var(--paper-deep)',
                  border: '1.5px solid var(--ink)',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>💾 Synced locally without sign-in</span>
                <span style={{ color: 'var(--ink-soft)' }}>Wiktionary Integration</span>
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
            <strong style={{ fontFamily: 'var(--font-display)' }}>Searchbook</strong> — The Open Digital Library.
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
                About Searchbook
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
              <strong>Searchbook</strong> is a quiet, personal space for your reading life. No algorithmic feeds, no influencer clout, no advertisements, and no tracking.
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
