import { Book, ReadingGoal, VocabularyWord } from '../types';
import PUBLIC_BOOKS_DATA from '../data/public-books.json';

export const PUBLIC_CATALOG: Book[] = PUBLIC_BOOKS_DATA as Book[];

export const SEED_BOOKS: Book[] = [
  {
    id: 'sapiens',
    slug: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: 2014,
    genre: 'Non-Fiction / History',
    pages: 443,
    rating: 5,
    status: 'finished',
    startedDate: '2026-01-05',
    finishedDate: '2026-01-28',
    coverImage: '/covers/sapiens.jpg',
    colorIndex: 0,
    synopsis: 'Explores how biology and history have defined us and enhanced our understanding of what it means to be human.',
    review: 'A breathtaking sweep through cognitive, agricultural, and scientific revolutions.',
   notes: 'Key concepts: Shared fictions, imagined orders, capitalism as a religion.',
    downloadPdfUrl: 'https://archive.org/download/sapiens-brief-history/sapiens.pdf',
    downloadEpubUrl: 'https://archive.org/download/sapiens-brief-history/sapiens.epub',
    fileSize: '3.4 MB',
    downloadCount: 4210,
    isFavorite: true,
    openSourceProvider: 'Internet Archive',
  },
  {
    id: 'atomic-habits',
    slug: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    genre: 'Self-Help / Psychology',
    pages: 320,
    rating: 4,
    status: 'finished',
    startedDate: '2026-02-01',
    finishedDate: '2026-02-14',
    coverImage: '/covers/atomic-habits.jpg',
    colorIndex: 3,
    synopsis: 'An easy and proven way to build good habits and break bad ones through tiny compounding changes.',
    review: 'Extremely practical framework for habit architecture.',
   notes: 'Four Laws of Behavior Change: Make it obvious, attractive, easy, satisfying.',
    downloadPdfUrl: 'https://archive.org/download/atomic-habits-james-clear/atomic-habits.pdf',
    downloadEpubUrl: 'https://archive.org/download/atomic-habits-james-clear/atomic-habits.epub',
    fileSize: '2.1 MB',
    downloadCount: 5690,
    isFavorite: true,
    openSourceProvider: 'Internet Archive',
  },
  {
    id: 'rivers-in-the-sky',
    slug: 'rivers-in-the-sky',
    title: 'There Are Rivers in the Sky',
    author: 'Elif Shafak',
    year: 2024,
    genre: 'Literary Fiction',
    pages: 448,
    currentPage: 168,
    rating: 0,
    status: 'reading',
    startedDate: '2026-03-01',
    coverImage: '/covers/rivers-in-the-sky.jpg',
    colorIndex: 2,
    synopsis: 'An epic narrative traversing ancient Nineveh, Victorian London, and contemporary Turkey through water, memory, and the Epic of Gilgamesh.',
    notes: 'Reading pace: Chapter 12. The metaphor of a single drop of water carrying historical memory across centuries.',
    downloadPdfUrl: 'https://archive.org/download/rivers-in-the-sky-elif-shafak/rivers-in-the-sky.pdf',
    downloadEpubUrl: 'https://archive.org/download/rivers-in-the-sky-elif-shafak/rivers-in-the-sky.epub',
    readOnlineUrl: 'https://archive.org/stream/rivers-in-the-sky-elif-shafak',
    fileSize: '3.1 MB',
    downloadCount: 2310,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'deep-work',
    slug: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    year: 2016,
    genre: 'Self-Help / Productivity',
    pages: 320,
    rating: 5,
    status: 'finished',
    startedDate: '2026-02-10',
    finishedDate: '2026-02-20',
    coverImage: 'https://covers.openlibrary.org/b/id/7988607-L.jpg',
    colorIndex: 10,
    synopsis: 'Rules for focused success in a distracted world. Developing the superpower of deep, uninterrupted focus.',
    review: 'Essential reading for any modern knowledge worker.',
    downloadPdfUrl: 'https://archive.org/download/deep-work-by-carl-newport/Deep%20Work%20by%20Carl%20Newport.pdf',
    downloadEpubUrl: 'https://archive.org/download/deep-work-by-carl-newport/Deep%20Work%20by%20Carl%20Newport.epub',
    readOnlineUrl: 'https://archive.org/stream/deep-work-by-carl-newport',
    openSourceProvider: 'Internet Archive (Full Open Access)',
    fileSize: '2.8 MB',
    downloadCount: 6420,
    isFavorite: true,
  },
  {
    id: '1984',
    slug: '1984',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'Dystopian Fiction',
    pages: 328,
    rating: 5,
    status: 'finished',
    startedDate: '2025-11-10',
    finishedDate: '2025-11-30',
    coverImage: '/covers/1984.jpg',
    colorIndex: 0,
    synopsis: 'In a totalitarian future under the watchful gaze of Big Brother, Winston Smith dares to rebel through love and truth.',
    review: 'A haunting prophecy on the manipulation of language, surveillance, and objective reality.',
    notes: 'Doublethink: To hold simultaneously two opinions which cancelled out, knowing them to be contradictory.',
    readOnlineUrl: 'https://archive.org/stream/1984-george-orwell',
    previewUrl: 'https://openlibrary.org/works/OL1168083W/1984',
    downloadUrl: 'https://archive.org/download/1984-george-orwell/1984-george-orwell.epub',
    downloadEpubUrl: 'https://archive.org/download/1984-george-orwell/1984-george-orwell.epub',
    downloadPdfUrl: 'https://archive.org/download/1984-george-orwell/1984-george-orwell.pdf',
    downloadCount: 3820,
    fileSize: '1.4 MB',
    isPublicDomain: true,
    openSourceProvider: 'Internet Archive (Open Access)',
  },
  {
    id: 'silent-patient',
    slug: 'silent-patient',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    year: 2019,
    genre: 'Psychological Thriller',
    pages: 336,
    rating: 5,
    status: 'finished',
    startedDate: '2026-02-18',
    finishedDate: '2026-02-23',
    coverImage: '/covers/silent-patient.jpg',
    colorIndex: 4,
    synopsis: 'Alicia Berenson shoots her husband five times in the face and never speaks another word.',
    review: 'Incredible plot twist woven seamlessly into Greek mythological tragedy (Alcestis).',
    downloadPdfUrl: 'https://archive.org/download/the-silent-patient-alex-michaelides/the-silent-patient.pdf',
    downloadEpubUrl: 'https://archive.org/download/the-silent-patient-alex-michaelides/the-silent-patient.epub',
    readOnlineUrl: 'https://archive.org/stream/the-silent-patient-alex-michaelides',
    fileSize: '2.4 MB',
    downloadCount: 6180,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'dark-matter',
    slug: 'dark-matter',
    title: 'Dark Matter',
    author: 'Blake Crouch',
    year: 2016,
    genre: 'Science Fiction Thriller',
    pages: 352,
    rating: 0,
    status: 'want_to_read',
    coverImage: '/covers/dark-matter.jpg',
    colorIndex: 11,
    synopsis: 'Are you happy with your life? Jason Dessen is kidnapped into an alternate reality where his life took a drastically different path.',
    notes: 'Queued on TBR shelf.',
    downloadPdfUrl: 'https://archive.org/download/dark-matter-blake-crouch/dark-matter.pdf',
    downloadEpubUrl: 'https://archive.org/download/dark-matter-blake-crouch/dark-matter.epub',
    readOnlineUrl: 'https://archive.org/stream/dark-matter-blake-crouch',
    fileSize: '2.5 MB',
    downloadCount: 3450,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'psychology-of-money',
    slug: 'psychology-of-money',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: 2020,
    genre: 'Finance / Behavioral Science',
    pages: 256,
    rating: 5,
    status: 'finished',
    startedDate: '2026-01-12',
    finishedDate: '2026-01-20',
    coverImage: '/covers/psychology-of-money.jpg',
    colorIndex: 1,
    synopsis: 'Timeless lessons on wealth, greed, and happiness doing well with money isn’t about what you know, it’s about how you behave.',
    review: 'One of the best books on financial sanity ever written.',
    notes: '<b>Core Insight:</b> Doing well with money has a little to do with how smart you are and a lot to do with how you behave.<br/><br/><b>Key Takeaways:</b><br/>• <i>Freedom over luxury:</i> The highest form of wealth is waking up and having control over your time.<br/>• <i>Compounding requires endurance:</i> The best investment strategy is the one that lets you sleep at night.<br/>• <i>Enough:</i> The hardest financial skill is getting the goalpost to stop moving.',
    downloadPdfUrl: 'https://archive.org/download/psychology-of-money-housel/psychology-of-money.pdf',
    downloadEpubUrl: 'https://archive.org/download/psychology-of-money-housel/psychology-of-money.epub',
    readOnlineUrl: 'https://archive.org/stream/psychology-of-money-housel',
    fileSize: '1.5 MB',
    downloadCount: 4890,
    openSourceProvider: 'Internet Archive',
  },
  {
    id: 'hitchhikers-guide',
    slug: 'hitchhikers-guide',
    title: "The Hitchhiker's Guide to the Galaxy",
    author: 'Douglas Adams',
    year: 1979,
    genre: 'Comic Science Fiction',
    pages: 216,
    rating: 4,
    status: 'finished',
    startedDate: '2025-12-05',
    finishedDate: '2025-12-15',
    coverImage: '/covers/hitchhikers-guide.jpg',
    colorIndex: 6,
    synopsis: 'Seconds before Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked into outer space.',
    review: 'Pure comedic genius and satirical brilliance.',
    downloadPdfUrl: 'https://archive.org/download/hitchhikers-guide-to-the-galaxy/hitchhikers-guide.pdf',
    downloadEpubUrl: 'https://archive.org/download/hitchhikers-guide-to-the-galaxy/hitchhikers-guide.epub',
    readOnlineUrl: 'https://archive.org/stream/hitchhikers-guide-to-the-galaxy',
    fileSize: '1.2 MB',
    downloadCount: 8900,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'lessons-in-chemistry',
    slug: 'lessons-in-chemistry',
    title: 'Lessons in Chemistry',
    author: 'Bonnie Garmus',
    year: 2022,
    genre: 'Historical Fiction',
    pages: 400,
    rating: 5,
    status: 'finished',
    startedDate: '2026-02-25',
    finishedDate: '2026-03-05',
    coverImage: '/covers/lessons-in-chemistry.jpg',
    colorIndex: 7,
    synopsis: 'Chemist Elizabeth Zott becomes the reluctant star of America’s most beloved cooking show in the early 1960s.',
    review: 'Uncompromisingly witty, warm, and inspiring.',
    downloadPdfUrl: 'https://archive.org/download/lessons-in-chemistry-bonnie-garmus/lessons-in-chemistry.pdf',
    downloadEpubUrl: 'https://archive.org/download/lessons-in-chemistry-bonnie-garmus/lessons-in-chemistry.epub',
    readOnlineUrl: 'https://archive.org/stream/lessons-in-chemistry-bonnie-garmus',
    fileSize: '2.9 MB',
    downloadCount: 5120,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'crawdads-sing',
    slug: 'crawdads-sing',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    year: 2018,
    genre: 'Literary Mystery',
    pages: 384,
    rating: 5,
    status: 'finished',
    startedDate: '2026-01-22',
    finishedDate: '2026-02-08',
    coverImage: '/covers/crawdads-sing.jpg',
    colorIndex: 8,
    synopsis: 'For years, rumors of the "Marsh Girl" haunted Barkley Cove, a quiet fishing village on the North Carolina coast.',
    review: 'Lush natural prose paired with an aching coming-of-age mystery.',
    downloadPdfUrl: 'https://archive.org/download/where-the-crawdads-sing-delia-owens/crawdads-sing.pdf',
    downloadEpubUrl: 'https://archive.org/download/where-the-crawdads-sing-delia-owens/crawdads-sing.epub',
    readOnlineUrl: 'https://archive.org/stream/where-the-crawdads-sing-delia-owens',
    fileSize: '2.7 MB',
    downloadCount: 7890,
    openSourceProvider: 'Open Digital Library',
  },
  {
    id: 'catch-22',
    slug: 'catch-22',
    title: 'Catch-22',
    author: 'Joseph Heller',
    year: 1961,
    genre: 'Classic Satire',
    pages: 453,
    rating: 0,
    status: 'want_to_read',
    coverImage: '/covers/catch-22.jpg',
    colorIndex: 2,
    synopsis: 'Set in Italy during World War II, bombardier Yossarian discovers a bureaucratic rule that prevents anyone from being grounded.',
    notes: 'Queued on TBR shelf.',
    downloadPdfUrl: 'https://archive.org/download/catch-22-heller/catch-22.pdf',
    downloadEpubUrl: 'https://archive.org/download/catch-22-heller/catch-22.epub',
    readOnlineUrl: 'https://archive.org/stream/catch-22-heller',
    isPublicDomain: true,
    fileSize: '2.8 MB',
    downloadCount: 1940,
    openSourceProvider: 'Internet Archive (Open Access)',
  },
];

export const SEED_VOCABULARY: VocabularyWord[] = [
  {
    id: 'vocab-1',
    word: 'Apotheosis',
    phonetic: '/əˌpɒθiˈoʊsɪs/',
    partOfSpeech: 'noun',
    definition: 'The highest point in the development of something; culmination or deification.',
    sampleSentence: 'The ending represented the apotheosis of his narrative vision.',
    bookTitle: 'Where the Crawdads Sing',
    bookSlug: 'crawdads-sing',
    dateAdded: '2026-02-05',
    mastered: true,
  },
  {
    id: 'vocab-2',
    word: 'Inchoate',
    phonetic: '/ɪnˈkoʊɪt/',
    partOfSpeech: 'adjective',
    definition: 'Just begun and so not fully formed or developed; rudimentary.',
    sampleSentence: 'An inchoate longing that she could neither articulate nor suppress.',
    bookTitle: 'There Are Rivers in the Sky',
    bookSlug: 'rivers-in-the-sky',
    dateAdded: '2026-03-02',
    mastered: false,
  },
  {
    id: 'vocab-3',
    word: 'Palimpsest',
    phonetic: '/ˈpælɪmpsɛst/',
    partOfSpeech: 'noun',
    definition: 'Something reused or altered but still bearing visible traces of its earlier form.',
    sampleSentence: 'London was a palimpsest of forgotten Roman docks and smoke-stained brick.',
    bookTitle: '1984',
    bookSlug: '1984',
    dateAdded: '2025-11-20',
    mastered: true,
  },
];

const BOOKS_KEY = 'booksearch_library_v5';
const VOCAB_KEY = 'booksearch_vocab_v3';
const GOAL_KEY = 'booksearch_goal_v3';

const DEFAULT_GOAL: ReadingGoal = {
  year: 2026,
  targetBooks: 24,
  finishedBooks: 8,
  targetPages: 8000,
  readPages: 2797,
};

export class LibraryStore {
  public static getBooks(): Book[] {
    try {
      const stored = localStorage.getItem(BOOKS_KEY);
      if (stored) {
        const rawParsed: Book[] = JSON.parse(stored);
        const parsed = Array.isArray(rawParsed) ? rawParsed.filter((b) => Boolean(b && b.id && b.slug)) : [];
        if (parsed.length > 0) {
          // Enrich stored books with latest download URLs, notes, and reviews
          const catalogMap = new Map(PUBLIC_CATALOG.map((b) => [b.slug || b.id, b]));
          const seedMap = new Map(SEED_BOOKS.map((b) => [b.slug || b.id, b]));
          const updated = parsed.map((b) => {
            const catalogBook = catalogMap.get(b.slug || b.id);
            const seedBook = seedMap.get(b.slug || b.id);
            const source = seedBook || catalogBook;
            if (source) {
              return {
                ...b,
                notes: b.notes || source.notes,
                review: b.review || source.review,
                downloadPdfUrl: b.downloadPdfUrl || source.downloadPdfUrl,
                downloadEpubUrl: b.downloadEpubUrl || source.downloadEpubUrl,
                readOnlineUrl: b.readOnlineUrl || source.readOnlineUrl,
                openSourceProvider: b.openSourceProvider || source.openSourceProvider,
              };
            }
            return b;
          });
          const existingSlugs = new Set(updated.map((b) => b.slug));
          const missing = PUBLIC_CATALOG.filter((b) => !existingSlugs.has(b.slug));
          const merged = missing.length > 0 ? [...updated, ...missing] : updated;
          this.saveBooks(merged);
          return merged;
        }
      }
    } catch {
      // fallback
    }
    const initial = PUBLIC_CATALOG.length > 0 ? PUBLIC_CATALOG : SEED_BOOKS;
    this.saveBooks(initial);
    return initial;
  }

  public static saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    } catch {
      // ignore
    }
  }

  public static addBook(book: Omit<Book, 'id'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: `book-${Date.now()}`,
    };
    books.unshift(newBook);
    this.saveBooks(books);
    return newBook;
  }

  public static updateBook(id: string, updates: Partial<Book>): Book | undefined {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) return undefined;

    books[index] = { ...books[index], ...updates };
    this.saveBooks(books);
    return books[index];
  }

  public static deleteBook(id: string): void {
    const books = this.getBooks().filter((b) => b.id !== id);
    this.saveBooks(books);
  }

  public static recordDownload(id: string, _format: 'pdf' | 'epub' = 'pdf'): void {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books[index].downloadCount = (books[index].downloadCount || 0) + 1;
      this.saveBooks(books);
    }
  }

  public static toggleFavorite(id: string): void {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books[index].isFavorite = !books[index].isFavorite;
      this.saveBooks(books);
    }
  }

  public static getVocabulary(): VocabularyWord[] {
    try {
      const stored = localStorage.getItem(VOCAB_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveVocabulary(SEED_VOCABULARY);
    return SEED_VOCABULARY;
  }

  public static saveVocabulary(words: VocabularyWord[]): void {
    try {
      localStorage.setItem(VOCAB_KEY, JSON.stringify(words));
    } catch {
      // ignore
    }
  }

  public static addVocabulary(word: Omit<VocabularyWord, 'id' | 'dateAdded'>): VocabularyWord {
    const words = this.getVocabulary();
    const newWord: VocabularyWord = {
      ...word,
      id: `vocab-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    words.unshift(newWord);
    this.saveVocabulary(words);
    return newWord;
  }

  public static toggleVocabularyMastered(id: string): void {
    const words = this.getVocabulary().map((w) =>
      w.id === id ? { ...w, mastered: !w.mastered } : w
    );
    this.saveVocabulary(words);
  }

  public static deleteVocabulary(id: string): void {
    const words = this.getVocabulary().filter((w) => w.id !== id);
    this.saveVocabulary(words);
  }

  public static getReadingGoal(): ReadingGoal {
    try {
      const stored = localStorage.getItem(GOAL_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_GOAL;
  }

  public static exportBackupJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      books: this.getBooks(),
      vocabulary: this.getVocabulary(),
      goal: this.getReadingGoal(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.books)) this.saveBooks(parsed.books);
      if (Array.isArray(parsed.vocabulary)) this.saveVocabulary(parsed.vocabulary);
      return true;
    } catch {
      return false;
    }
  }

  public static exportMarkdownNotes(): string {
    const books = this.getBooks();
    let md = `# BookSearch Reading Notes\nExported: ${new Date().toLocaleDateString()}\n\n`;

    books.forEach((b) => {
      md += `## ${b.title} by ${b.author} (${b.year})\n`;
      md += `- **Status**: ${b.status} | **Rating**: ${b.rating}/5 | **Pages**: ${b.pages}\n`;
      if (b.review) md += `\n### Review\n${b.review}\n`;
      if (b.notes) md += `\n### Notes\n${b.notes}\n`;
      md += `\n---\n\n`;
    });

    return md;
  }
}
