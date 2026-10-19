import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import LogoMark from './LogoMark';
import { useI18n } from '../lib/i18n';
import { SimulatedCursor, ScriptStep } from './SimulatedCursor';

interface LandingViewProps {
  onOpenAdmin: () => void;
  onNavigate?: (tab: 'home' | 'library' | 'vocab' | 'stats' | 'about' | 'contact' | 'features') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAdmin, onNavigate }) => {
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
      title: 'Atomic Habits',
      author: 'James Clear',
      year: 2018,
      genre: 'Self-Help / Psychology',
      pdfSize: '2.1 MB',
      epubSize: '1.1 MB',
      pages: 320,
      coverImage: 'https://covers.openlibrary.org/b/id/12539702-L.jpg',
      bg: '#ff8a00',
    },
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      year: 2016,
      genre: 'Productivity',
      pdfSize: '2.8 MB',
      epubSize: '1.5 MB',
      pages: 320,
      coverImage: 'https://covers.openlibrary.org/b/id/7988607-L.jpg',
      bg: '#ffd400',
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      year: 2020,
      genre: 'Finance / Psychology',
      pdfSize: '1.5 MB',
      epubSize: '920 KB',
      pages: 256,
      coverImage: 'https://covers.openlibrary.org/b/id/10389354-L.jpg',
      bg: '#00994d',
    },
    {
      title: 'The Subtle Art of Not Giving a F*ck',
      author: 'Mark Manson',
      year: 2016,
      genre: 'Self-Help / Philosophy',
      pdfSize: '1.9 MB',
      epubSize: '980 KB',
      pages: 224,
      coverImage: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
      bg: '#ff3b1f',
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      year: 2011,
      genre: 'Psychology / Decision Making',
      pdfSize: '3.2 MB',
      epubSize: '1.8 MB',
      pages: 499,
      coverImage: 'https://covers.openlibrary.org/b/id/13290711-L.jpg',
      bg: '#1a34d6',
    },
    {
      title: "Can't Hurt Me",
      author: 'David Goggins',
      year: 2018,
      genre: 'Memoir / Self-Help',
      pdfSize: '2.6 MB',
      epubSize: '1.4 MB',
      pages: 364,
      coverImage: 'https://covers.openlibrary.org/b/id/10021591-L.jpg',
      bg: '#333333',
    },
    {
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'Dystopian Fiction',
      pdfSize: '1.4 MB',
      epubSize: '820 KB',
      pages: 328,
      coverImage: 'https://covers.openlibrary.org/b/id/9267242-L.jpg',
      bg: '#111111',
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
  const [liveDraftText, setLiveDraftText] = useState('');
  const [isDraftBold, setIsDraftBold] = useState(false);

  interface DemoNoteItem {
    id: string;
    book: string;
    type: string;
    text: string;
    color: string;
    highlight: string;
    bold?: boolean;
  }

  const initialDemoNotes: DemoNoteItem[] = useMemo(() => [
    {
      id: 'q1',
      book: 'Atomic Habits',
      type: 'quote',
      text: '“You do not rise to the level of your goals. You fall to the level of your systems.”',
      color: '#111111',
      highlight: '#fef08a',
      bold: false,
    },
    {
      id: 'q2',
      book: 'Deep Work',
      type: 'quote',
      text: '“Clarity about what matters provides clarity about what does not.”',
      color: '#1a34d6',
      highlight: '#bae6fd',
      bold: true,
    },
  ], []);

  const [noteItems, setNoteItems] = useState<DemoNoteItem[]>(initialDemoNotes);

  // Demo 1 Automated Timeline: Cycles across 6 confidence & reliability books
  const demo1Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 500 },

    // Book 1: Atomic Habits
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 420,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 150 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: 'Atomic Habits',
      speedMs: 65,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-pdf-btn-Atomic Habits"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-pdf-btn-Atomic Habits"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-pdf-btn-Atomic Habits"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('Atomic Habits', 'PDF');
      },
    },
    { type: 'wait', ms: 1100 },
    {
      type: 'move',
      target: '[data-tour="demo1-clear-btn"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="demo1-clear-btn"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="demo1-clear-btn"]',
      holdMs: 110,
    },
    {
      type: 'action',
      run: () => {
        setSearchQuery('');
      },
    },
    { type: 'wait', ms: 300 },

    // Book 2: Deep Work
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 380,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: 'Deep Work',
      speedMs: 65,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-epub-btn-Deep Work"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-epub-btn-Deep Work"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-epub-btn-Deep Work"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('Deep Work', 'EPUB');
      },
    },
    { type: 'wait', ms: 1100 },
    {
      type: 'move',
      target: '[data-tour="demo1-clear-btn"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="demo1-clear-btn"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="demo1-clear-btn"]',
      holdMs: 110,
    },
    {
      type: 'action',
      run: () => {
        setSearchQuery('');
      },
    },
    { type: 'wait', ms: 300 },

    // Book 3: The Psychology of Money
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 380,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: 'Psychology of Money',
      speedMs: 60,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-pdf-btn-The Psychology of Money"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-pdf-btn-The Psychology of Money"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-pdf-btn-The Psychology of Money"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('The Psychology of Money', 'PDF');
      },
    },
    { type: 'wait', ms: 1100 },
    {
      type: 'move',
      target: '[data-tour="demo1-clear-btn"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="demo1-clear-btn"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="demo1-clear-btn"]',
      holdMs: 110,
    },
    {
      type: 'action',
      run: () => {
        setSearchQuery('');
      },
    },
    { type: 'wait', ms: 300 },

    // Book 4: The Subtle Art
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 380,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: 'The Subtle Art',
      speedMs: 65,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-epub-btn-The Subtle Art of Not Giving a F*ck"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-epub-btn-The Subtle Art of Not Giving a F*ck"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-epub-btn-The Subtle Art of Not Giving a F*ck"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('The Subtle Art of Not Giving a F*ck', 'EPUB');
      },
    },
    { type: 'wait', ms: 1100 },
    {
      type: 'move',
      target: '[data-tour="demo1-clear-btn"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="demo1-clear-btn"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="demo1-clear-btn"]',
      holdMs: 110,
    },
    {
      type: 'action',
      run: () => {
        setSearchQuery('');
      },
    },
    { type: 'wait', ms: 300 },

    // Book 5: Thinking, Fast and Slow
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 380,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: 'Thinking, Fast',
      speedMs: 65,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-pdf-btn-Thinking, Fast and Slow"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-pdf-btn-Thinking, Fast and Slow"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-pdf-btn-Thinking, Fast and Slow"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload('Thinking, Fast and Slow', 'PDF');
      },
    },
    { type: 'wait', ms: 1100 },
    {
      type: 'move',
      target: '[data-tour="demo1-clear-btn"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="demo1-clear-btn"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="demo1-clear-btn"]',
      holdMs: 110,
    },
    {
      type: 'action',
      run: () => {
        setSearchQuery('');
      },
    },
    { type: 'wait', ms: 300 },

    // Book 6: Can't Hurt Me
    {
      type: 'move',
      target: '[data-tour="demo1-search-input"]',
      shape: 'text',
      duration: 380,
      hoverSelector: '[data-tour="demo1-search-input"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'type',
      target: '[data-tour="demo1-search-input"]',
      text: "Can't Hurt Me",
      speedMs: 65,
      onChar: (t) => setSearchQuery(t),
    },
    { type: 'wait', ms: 350 },
    {
      type: 'move',
      target: '[data-tour="demo1-epub-btn-Can\'t Hurt Me"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="demo1-epub-btn-Can\'t Hurt Me"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="demo1-epub-btn-Can\'t Hurt Me"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => {
        handleSimulateDownload("Can't Hurt Me", 'EPUB');
      },
    },
    { type: 'wait', ms: 1200 },
    {
      type: 'move',
      target: '[data-tour="demo1-storage-badge"]',
      shape: 'arrow',
      duration: 500,
    },
    { type: 'wait', ms: 2200 },
  ], []);

  const handleDemo1Reset = useCallback(() => {
    setSearchQuery('');
    setDownloadingAction(null);
    setDownloadProgress(0);
    setDownloadSuccessMessage(null);
  }, []);

  // Demo 2 Automated Timeline: Actively demonstrates 5-6 quotes, ink colors, and marker highlighters
  const demo2Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 500 },

    // Quote 3: The Psychology of Money (Green ink + Mint highlight)
    {
      type: 'move',
      target: '[data-tour="ink-green"]',
      shape: 'pointer',
      duration: 400,
      hoverSelector: '[data-tour="ink-green"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="ink-green"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveTextColor('#00994d'),
    },
    { type: 'wait', ms: 180 },
    {
      type: 'move',
      target: '[data-tour="marker-mint"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="marker-mint"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="marker-mint"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveHighlightColor('#bbf7d0'),
    },
    { type: 'wait', ms: 200 },
    {
      type: 'move',
      target: '[data-tour="notes-canvas"]',
      shape: 'text',
      duration: 400,
    },
    {
      type: 'type',
      target: '[data-tour="notes-canvas"]',
      text: 'Doing well with money is about behavior.',
      speedMs: 50,
      onChar: (t) => setLiveDraftText(t),
    },
    { type: 'wait', ms: 250 },
    {
      type: 'action',
      run: () => {
        setNoteItems((prev) => [
          ...prev,
          {
            id: 'q3',
            book: 'The Psychology of Money',
            type: 'quote',
            text: '“Doing well with money has a little to do with how smart you are and a lot to do with how you behave.”',
            color: '#00994d',
            highlight: '#bbf7d0',
            bold: false,
          },
        ]);
        setLiveDraftText('');
      },
    },
    { type: 'wait', ms: 500 },

    // Quote 4: The Subtle Art (Vermilion ink + Pink highlight + Bold)
    {
      type: 'move',
      target: '[data-tour="ink-vermilion"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="ink-vermilion"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="ink-vermilion"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveTextColor('#ff3b1f'),
    },
    { type: 'wait', ms: 180 },
    {
      type: 'move',
      target: '[data-tour="marker-pink"]',
      shape: 'pointer',
      duration: 360,
      hoverSelector: '[data-tour="marker-pink"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="marker-pink"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveHighlightColor('#fbcfe8'),
    },
    { type: 'wait', ms: 180 },
    {
      type: 'move',
      target: '[data-tour="tool-bold"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="tool-bold"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="tool-bold"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => {
        setNoteItems((prev) => [
          ...prev,
          {
            id: 'q4',
            book: 'The Subtle Art of Not Giving a F*ck',
            type: 'quote',
            text: '“Who you are is defined by what you’re willing to struggle for.”',
            color: '#ff3b1f',
            highlight: '#fbcfe8',
            bold: true,
          },
        ]);
      },
    },
    { type: 'wait', ms: 500 },

    // Quote 5: Thinking, Fast and Slow (Purple ink + Orange highlight)
    {
      type: 'move',
      target: '[data-tour="ink-purple"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="ink-purple"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="ink-purple"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveTextColor('#6a2ecf'),
    },
    { type: 'wait', ms: 180 },
    {
      type: 'move',
      target: '[data-tour="marker-orange"]',
      shape: 'pointer',
      duration: 360,
      hoverSelector: '[data-tour="marker-orange"]',
    },
    { type: 'wait', ms: 140 },
    {
      type: 'click',
      target: '[data-tour="marker-orange"]',
      holdMs: 120,
    },
    {
      type: 'action',
      run: () => setActiveHighlightColor('#fed7aa'),
    },
    { type: 'wait', ms: 180 },
    {
      type: 'action',
      run: () => {
        setNoteItems((prev) => [
          ...prev,
          {
            id: 'q5',
            book: 'Thinking, Fast and Slow',
            type: 'quote',
            text: '“A reliable way to make people believe in falsehoods is frequent repetition.”',
            color: '#6a2ecf',
            highlight: '#fed7aa',
            bold: false,
          },
        ]);
      },
    },
    { type: 'wait', ms: 500 },

    // Quote 6: Can't Hurt Me (Ink Black + Yellow highlight + Bold)
    {
      type: 'move',
      target: '[data-tour="ink-black"]',
      shape: 'pointer',
      duration: 360,
      hoverSelector: '[data-tour="ink-black"]',
    },
    { type: 'wait', ms: 120 },
    {
      type: 'click',
      target: '[data-tour="ink-black"]',
      holdMs: 100,
    },
    {
      type: 'action',
      run: () => setActiveTextColor('#111111'),
    },
    { type: 'wait', ms: 160 },
    {
      type: 'move',
      target: '[data-tour="marker-yellow"]',
      shape: 'pointer',
      duration: 360,
      hoverSelector: '[data-tour="marker-yellow"]',
    },
    { type: 'wait', ms: 120 },
    {
      type: 'click',
      target: '[data-tour="marker-yellow"]',
      holdMs: 100,
    },
    {
      type: 'action',
      run: () => setActiveHighlightColor('#fef08a'),
    },
    { type: 'wait', ms: 160 },
    {
      type: 'action',
      run: () => {
        setNoteItems((prev) => [
          ...prev,
          {
            id: 'q6',
            book: "Can't Hurt Me",
            type: 'quote',
            text: '“The most important conversations you’ll ever have are the ones you’ll have with yourself.”',
            color: '#111111',
            highlight: '#fef08a',
            bold: true,
          },
        ]);
      },
    },
    { type: 'wait', ms: 400 },

    // Save Note Action
    {
      type: 'move',
      target: '[data-tour="tool-save-btn"]',
      shape: 'pointer',
      duration: 420,
      hoverSelector: '[data-tour="tool-save-btn"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="tool-save-btn"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => setNotesSaveStatus('Auto-saved to device'),
    },
    { type: 'wait', ms: 400 },
    {
      type: 'move',
      target: '[data-tour="notes-canvas"]',
      shape: 'arrow',
      duration: 480,
    },
    { type: 'wait', ms: 2600 },
  ], []);

  const handleDemo2Reset = useCallback(() => {
    setNoteItems(initialDemoNotes);
    setLiveDraftText('');
    setIsDraftBold(false);
    setActiveHighlightColor('#fef08a');
    setActiveTextColor('#111111');
    setNotesSaveStatus(null);
  }, [initialDemoNotes]);

  // Interactive state for Demo 3: Stats & Reading Corpus with Dynamic Month Numbers & Curated Books
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('Feb');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  interface MonthDetailInfo {
    volumes: number;
    pages: number;
    rating: string;
    streak: number;
    label: string;
    books: Array<{ title: string; author: string; pages: number; rating: number; color: string }>;
  }

  const MONTH_STATS: Record<string, MonthDetailInfo> = useMemo(() => ({
    Jan: {
      volumes: 3,
      pages: 980,
      rating: '★ 4.5',
      streak: 14,
      label: 'January 2026',
      books: [
        { title: 'Sapiens', author: 'Yuval Noah Harari', pages: 443, rating: 5, color: '#00994d' },
        { title: 'Atomic Habits', author: 'James Clear', pages: 320, rating: 4, color: '#ff8a00' },
        { title: 'The Midnight Library', author: 'Matt Haig', pages: 304, rating: 4.5, color: '#1a34d6' },
      ],
    },
    Feb: {
      volumes: 4,
      pages: 1240,
      rating: '★ 4.8',
      streak: 16,
      label: 'February 2026',
      books: [
        { title: 'Atomic Habits', author: 'James Clear', pages: 320, rating: 5, color: '#ff8a00' },
        { title: 'Deep Work', author: 'Cal Newport', pages: 320, rating: 5, color: '#ffd400' },
        { title: 'The Psychology of Money', author: 'Morgan Housel', pages: 256, rating: 4.5, color: '#00994d' },
        { title: 'The Silent Patient', author: 'Alex Michaelides', pages: 336, rating: 4.5, color: '#ff5fa2' },
      ],
    },
    Mar: {
      volumes: 2,
      pages: 620,
      rating: '★ 4.2',
      streak: 11,
      label: 'March 2026',
      books: [
        { title: 'There Are Rivers in the Sky', author: 'Elif Shafak', pages: 448, rating: 4, color: '#1a34d6' },
        { title: 'Lessons in Chemistry', author: 'Bonnie Garmus', pages: 400, rating: 4.5, color: '#00b6d8' },
      ],
    },
    Apr: {
      volumes: 5,
      pages: 1590,
      rating: '★ 4.9',
      streak: 21,
      label: 'April 2026 (Peak Month)',
      books: [
        { title: '1984', author: 'George Orwell', pages: 328, rating: 5, color: '#111111' },
        { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', pages: 224, rating: 4.5, color: '#ff3b1f' },
        { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', pages: 499, rating: 5, color: '#1a34d6' },
        { title: 'Where the Crawdads Sing', author: 'Delia Owens', pages: 384, rating: 4.5, color: '#00994d' },
        { title: 'Dune', author: 'Frank Herbert', pages: 412, rating: 5, color: '#ff8a00' },
      ],
    },
    May: {
      volumes: 3,
      pages: 890,
      rating: '★ 4.4',
      streak: 15,
      label: 'May 2026',
      books: [
        { title: "Can't Hurt Me", author: 'David Goggins', pages: 364, rating: 4.5, color: '#333333' },
        { title: 'Grit', author: 'Angela Duckworth', pages: 320, rating: 4, color: '#ff5fa2' },
        { title: 'Essentialism', author: 'Greg McKeown', pages: 320, rating: 4.5, color: '#00994d' },
      ],
    },
    Jun: {
      volumes: 4,
      pages: 1110,
      rating: '★ 4.7',
      streak: 19,
      label: 'June 2026',
      books: [
        { title: 'Flow', author: 'Mihaly Csikszentmihalyi', pages: 320, rating: 5, color: '#6a2ecf' },
        { title: 'The Power of Habit', author: 'Charles Duhigg', pages: 320, rating: 4.5, color: '#ff8a00' },
        { title: 'Man’s Search for Meaning', author: 'Viktor E. Frankl', pages: 200, rating: 5, color: '#111111' },
        { title: 'Shoe Dog', author: 'Phil Knight', pages: 320, rating: 4.5, color: '#ff3b1f' },
      ],
    },
    Jul: {
      volumes: 3,
      pages: 940,
      rating: '★ 4.6',
      streak: 17,
      label: 'July 2026',
      books: [
        { title: 'Brave New World', author: 'Aldous Huxley', pages: 320, rating: 4.5, color: '#00b6d8' },
        { title: 'Fahrenheit 451', author: 'Ray Bradbury', pages: 320, rating: 5, color: '#ff3b1f' },
        { title: 'Dark Matter', author: 'Blake Crouch', pages: 352, rating: 4.5, color: '#111111' },
      ],
    },
  }), []);

  // Demo 3 Automated Timeline: Cycles through Feb, Mar, Apr, and May automatically
  const demo3Steps: ScriptStep[] = useMemo(() => [
    { type: 'wait', ms: 500 },

    // Click Feb
    {
      type: 'move',
      target: '[data-tour="month-bar-Feb"]',
      shape: 'pointer',
      duration: 450,
      hoverSelector: '[data-tour="month-bar-Feb"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="month-bar-Feb"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => setSelectedMonthKey('Feb'),
    },
    { type: 'wait', ms: 900 },

    // Click Mar
    {
      type: 'move',
      target: '[data-tour="month-bar-Mar"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="month-bar-Mar"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="month-bar-Mar"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => setSelectedMonthKey('Mar'),
    },
    { type: 'wait', ms: 900 },

    // Click Apr (Peak)
    {
      type: 'move',
      target: '[data-tour="month-bar-Apr"]',
      shape: 'pointer',
      duration: 400,
      hoverSelector: '[data-tour="month-bar-Apr"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="month-bar-Apr"]',
      holdMs: 140,
    },
    {
      type: 'action',
      run: () => setSelectedMonthKey('Apr'),
    },
    { type: 'wait', ms: 900 },

    // Click May
    {
      type: 'move',
      target: '[data-tour="month-bar-May"]',
      shape: 'pointer',
      duration: 380,
      hoverSelector: '[data-tour="month-bar-May"]',
    },
    { type: 'wait', ms: 160 },
    {
      type: 'click',
      target: '[data-tour="month-bar-May"]',
      holdMs: 130,
    },
    {
      type: 'action',
      run: () => setSelectedMonthKey('May'),
    },
    { type: 'wait', ms: 700 },

    // Inspect Overview Card
    {
      type: 'move',
      target: '[data-tour="demo3-detail-box"]',
      shape: 'arrow',
      duration: 460,
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
        id: `note-${Date.now()}`,
        book: 'Personal Ledger',
        type,
        text,
        color: activeTextColor,
        highlight: activeHighlightColor,
      },
    ]);
    setNotesSaveStatus('Auto-saved to device');
    setTimeout(() => setNotesSaveStatus(null), 2500);
  };

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
      {/* ── TOPBAR (Synchronized with Navbar.tsx) ─────────────── */}
      <header className="appbar" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--paper)' }}>
        <div className="appbar-inner">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="appbar-logo text-left flex items-center gap-2"
            aria-label="Searchbook Home"
            title="Return to Home"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <LogoMark />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              Searchbook
            </span>
          </button>

          <nav className="appbar-nav" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('library');
                else onOpenAdmin();
              }}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.library')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.features')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('vocab')}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.vocab')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('stats')}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.stats')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('about')}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.about')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('contact')}
              className="appbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('nav.contact')}
            </button>
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', border: '2px solid var(--ink)', background: '#fff' }}>
              {(['en', 'es', 'fr', 'pt'] as const).map((lang, idx) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang)}
                  style={{
                    border: 'none',
                    borderLeft: idx > 0 ? '1px solid var(--ink)' : 'none',
                    background: locale === lang ? 'var(--ink)' : '#fff',
                    color: locale === lang ? '#fff' : 'var(--ink)',
                    padding: '3px 7px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
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
        <div className="sec-copy" style={{ alignSelf: 'start', position: 'sticky', top: '88px' }}>
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
                      data-tour="demo1-clear-btn"
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
                  {['Atomic Habits', 'Deep Work', 'Psychology of Money', 'The Subtle Art', 'Thinking, Fast', "Can't Hurt Me"].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      data-tour={`demo1-pill-${suggestion.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                      onClick={() => setSearchQuery(suggestion)}
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        border: '1.5px solid var(--ink)',
                        background: searchQuery.toLowerCase() === suggestion.toLowerCase() ? 'var(--ink)' : '#fff',
                        color: searchQuery.toLowerCase() === suggestion.toLowerCase() ? '#fff' : 'var(--ink)',
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

              {/* Animated Interactive Results Table with Balanced Height */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '345px', maxHeight: '420px', overflowY: 'auto' }}>
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
                            width: '46px',
                            height: '66px',
                            background: book.bg,
                            border: '1.5px solid var(--ink)',
                            boxShadow: '1.5px 1.5px 0 var(--ink)',
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              loading="lazy"
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                padding: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                fontSize: '7px',
                                fontWeight: 900,
                                color: '#fff',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</span>
                              <span style={{ opacity: 0.75 }}>{book.year}</span>
                            </div>
                          )}
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
                {/* Structure and Typography buttons */}
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
                    data-tour="tool-bold"
                    className="btn btn--sm"
                    onClick={() => setIsDraftBold(!isDraftBold)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 900,
                      boxShadow: 'none',
                      borderLeft: '1px solid var(--ink)',
                      background: isDraftBold ? 'var(--ink)' : '#fff',
                      color: isDraftBold ? '#fff' : 'var(--ink)',
                    }}
                    title="Toggle Bold"
                  >
                    B
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
                    { color: '#fed7aa', name: 'Orange' },
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
                    { color: '#00994d', name: 'Green' },
                    { color: '#6a2ecf', name: 'Purple' },
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

                {/* Save Action Button */}
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {notesSaveStatus && (
                                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--accent)' }}>
                                      ✓ {notesSaveStatus}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    data-tour="tool-save-btn"
                                    className="btn btn--sm btn--primary"
                                    onClick={() => {
                                      setNotesSaveStatus('Auto-saved to device');
                                      setTimeout(() => setNotesSaveStatus(null), 2500);
                                    }}
                                    style={{ padding: '3px 8px', fontSize: '10.5px', boxShadow: 'none' }}
                                  >
                                    Save Note
                                  </button>
                                </div>
                              </div>

                              {/* Clean White Notes Canvas with Dynamic Quotes and Color Rendering */}
                                            <div
                                              data-tour="notes-canvas"
                                              style={{
                                                background: '#ffffff',
                                                border: '2px solid var(--ink)',
                                                padding: '14px',
                                                boxShadow: 'var(--hard)',
                                                minHeight: '220px',
                                                maxHeight: '280px',
                                                overflowY: 'auto',
                                              }}
                                            >
                                              {/* Active Live Typing Line Animation */}
                                              {liveDraftText && (
                                                <div style={{ marginBottom: '10px', fontSize: '13px', lineHeight: 1.5 }}>
                                                  <span
                                                    style={{
                                                      fontWeight: isDraftBold ? 800 : 600,
                                                      color: activeTextColor,
                                                      background: activeHighlightColor !== 'transparent' ? activeHighlightColor : undefined,
                                                      padding: activeHighlightColor !== 'transparent' ? '2px 6px' : undefined,
                                                    }}
                                                  >
                                                    {liveDraftText}
                                                  </span>
                                                  <span className="caret" />
                                                </div>
                                              )}

                                              {noteItems.map((item, idx) => (
                                                <motion.div
                                                  key={item.id || idx}
                                                  initial={{ opacity: 0, y: 6 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  style={{
                                                    marginBottom: '8px',
                                                    padding: '8px 12px',
                                                    borderLeft: `3.5px solid ${item.color || 'var(--ink)'}`,
                                                    background: item.highlight !== 'transparent' ? item.highlight : 'var(--paper-deep)',
                                                    borderTop: '1px solid rgba(17,17,17,0.06)',
                                                    borderRight: '1px solid rgba(17,17,17,0.06)',
                                                    borderBottom: '1px solid rgba(17,17,17,0.06)',
                                                  }}
                                                >
                                                  {item.book && (
                                                    <div
                                                      style={{
                                                        fontSize: '9.5px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        color: item.color,
                                                        letterSpacing: '0.08em',
                                                        marginBottom: '3px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                      }}
                                                    >
                                                      <span style={{ width: '6px', height: '6px', background: item.color, display: 'inline-block' }} />
                                                      <span>{item.book}</span>
                                                    </div>
                                                  )}
                                                  <div
                                                    style={{
                                                      fontStyle: 'italic',
                                                      fontWeight: item.bold ? 800 : 500,
                                                      fontSize: '13px',
                                                      lineHeight: 1.5,
                                                      color: item.color,
                                                    }}
                                                  >
                                                    {item.text}
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
              {/* Stat Tiles with Dynamic Monthly Numbers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  data-tour="stat-tile-volumes"
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px 14px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Volumes ({selectedMonthKey})
                  </div>
                  <motion.div
                    key={`vol-${selectedMonthKey}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, lineHeight: 1.1, margin: '4px 0 2px' }}
                  >
                    {MONTH_STATS[selectedMonthKey]?.volumes ?? 4}
                  </motion.div>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                    Finished on shelf
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px 14px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Pages ({selectedMonthKey})
                  </div>
                  <motion.div
                    key={`pages-${selectedMonthKey}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, lineHeight: 1.1, margin: '4px 0 2px' }}
                  >
                    {(MONTH_STATS[selectedMonthKey]?.pages ?? 1240).toLocaleString()}
                  </motion.div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                    ~{Math.round((MONTH_STATS[selectedMonthKey]?.pages ?? 1240) / (MONTH_STATS[selectedMonthKey]?.volumes ?? 4))} pp/vol
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px 14px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--ink-soft)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Critique Score
                  </div>
                  <motion.div
                    key={`rate-${selectedMonthKey}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, lineHeight: 1.1, margin: '4px 0 2px' }}
                  >
                    {MONTH_STATS[selectedMonthKey]?.rating ?? '★ 4.8'}
                  </motion.div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                    Rated reads
                  </span>
                </div>

                <div
                  style={{
                    border: '2px solid var(--ink)',
                    background: 'var(--white)',
                    padding: '12px 14px',
                    boxShadow: 'var(--hard)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Reading Streak
                  </div>
                  <motion.div
                    key={`streak-${selectedMonthKey}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, lineHeight: 1.1, margin: '4px 0 2px', color: 'var(--accent)' }}
                  >
                    {MONTH_STATS[selectedMonthKey]?.streak ?? 16} days
                  </motion.div>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                    Daily habit active
                  </span>
                </div>
              </div>

              {/* Monthly Interactive Chart Bar */}
              <div
                style={{
                  border: '2px solid var(--ink)',
                  background: 'var(--white)',
                  padding: '14px 16px',
                  boxShadow: 'var(--hard)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '12.5px' }}>
                      Monthly Reading Velocity
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        background: 'var(--ink)',
                        color: '#fff',
                        padding: '1px 6px',
                        border: '1px solid var(--ink)',
                      }}
                    >
                      {selectedMonthKey} 2026
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                    {hoveredMonth || `Inspecting: ${MONTH_STATS[selectedMonthKey]?.label || selectedMonthKey}`}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '10px',
                    height: '100px',
                    borderBottom: '2px solid var(--ink)',
                    paddingBottom: '2px',
                    position: 'relative',
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
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: isSelected ? 'var(--accent)' : 'var(--ink-soft)',
                            opacity: isSelected ? 1 : 0.7,
                          }}
                        >
                          {d.count}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${d.count * 15}px` }}
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
                            fontSize: '10.5px',
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

                {/* Selected Month Curated Book Breakdown */}
                <div
                  data-tour="demo3-detail-box"
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'var(--paper-deep)',
                    border: '1.5px solid var(--ink)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
                      Volumes Read in {MONTH_STATS[selectedMonthKey]?.label || selectedMonthKey} ({MONTH_STATS[selectedMonthKey]?.volumes || 0})
                    </span>
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => {
                        if (onNavigate) onNavigate('stats');
                        else onOpenAdmin();
                      }}
                      style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 700 }}
                    >
                      Full Statistics View →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                    {MONTH_STATS[selectedMonthKey]?.books.map((b, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--ink)',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ width: '6px', height: '6px', background: b.color, display: 'inline-block', marginRight: '6px' }} />
                          <strong style={{ fontWeight: 700 }}>{b.title}</strong>{' '}
                          <span style={{ color: 'var(--ink-soft)', fontSize: '10px' }}>· {b.author}</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', marginLeft: '6px', whiteSpace: 'nowrap' }}>
                          ★ {b.rating}
                        </span>
                      </div>
                    ))}
                  </div>
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
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('about');
              }}
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('contact');
              }}
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
    </div>
  );
};
