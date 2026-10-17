export type ReadingStatus = 'finished' | 'reading' | 'want_to_read' | 'dnf';

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorSlug?: string;
  year: number;
  genre: string;
  pages: number;
  currentPage?: number;
  rating: number; // 0 to 5
  status: ReadingStatus;
  startedDate?: string;
  finishedDate?: string;
  coverImage?: string;
  coverColor?: string;
  colorIndex?: number;
  synopsis: string;
  review?: string;
  notes?: string;
  readOnlineUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  downloadPdfUrl?: string;
  downloadEpubUrl?: string;
  fileSize?: string;
  downloadCount?: number;
  isFavorite?: boolean;
  isPublicDomain?: boolean;
  openSourceProvider?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  sampleSentence: string;
  bookTitle: string;
  bookSlug: string;
  dateAdded: string;
  mastered: boolean;
}

export interface ReadingGoal {
  year: number;
  targetBooks: number;
  finishedBooks: number;
  targetPages: number;
  readPages: number;
}
