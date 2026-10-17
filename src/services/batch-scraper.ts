import { BookScraper, ScrapedBookResult } from './scraper';
import { LibraryStore } from './library-store';
import { DatabaseClient } from '../lib/db';
import { Book } from '../types';

export interface BatchScrapeOptions {
  source: 'subject' | 'query' | 'isbns';
  term: string;
  limit: number;
  onProgress?: (current: number, total: number, latestTitle: string) => void;
}

export class BatchScraperEngine {
  /**
   * Scrapes books in bulk by subject/genre (e.g. "Philosophy", "Dystopian", "Psychology")
   */
  public static async scrapeBySubject(
    subject: string,
    limit = 100,
    onProgress?: (current: number, total: number, latestTitle: string) => void
  ): Promise<ScrapedBookResult[]> {
    const term = subject.trim();
    if (!term) return [];

    // Try Google Books subject search first for rich metadata & covers
    try {
      const googleResults = await BookScraper.scrapeGoogleBooks(`subject:${term}`, limit);
      if (googleResults.length > 0) {
        googleResults.forEach((b, idx) => {
          if (onProgress) onProgress(idx + 1, googleResults.length, b.title);
        });
        return googleResults;
      }
    } catch {
      // Fallback to Open Library subjects
    }

    const cleanSubject = encodeURIComponent(term.toLowerCase());
    const url = `https://openlibrary.org/subjects/${cleanSubject}.json?limit=${limit}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const works = data.works || [];
      const results: ScrapedBookResult[] = [];

      for (let i = 0; i < works.length; i++) {
        const w = works[i];
        const title = w.title || 'Untitled';
        const author = w.authors?.[0]?.name || 'Unknown Author';
        const coverId = w.cover_id;

        // Hotlinked cover URL (Zero cloud storage required)
        const coverImage = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : undefined;

        const book: ScrapedBookResult = {
          title,
          titleFr: title,
          author,
          year: w.first_publish_year,
          pages: 300, // median fallback for subject works
          genre: subject,
          genreFr: subject,
          coverImage,
          synopsis: `A classic work of ${subject} authored by ${author}.`,
          synopsisFr: `Un ouvrage marquant de ${subject} rédigé par ${author}.`,
          source: 'openlibrary',
        };

        results.push(book);
        if (onProgress) {
          onProgress(i + 1, works.length, title);
        }

        // Gentle pause to respect public Open Library rate limits
        if (i % 10 === 0) {
          await new Promise((r) => setTimeout(r, 80));
        }
      }

      return results;
    } catch (err) {
      console.error('[BatchScraper] Failed to scrape subject:', err);
      return [];
    }
  }

  /**
   * Scrapes books in bulk from a list of ISBNs
   */
  public static async scrapeByIsbnList(
    isbns: string[],
    onProgress?: (current: number, total: number, latestTitle: string) => void
  ): Promise<ScrapedBookResult[]> {
    const results: ScrapedBookResult[] = [];
    const total = isbns.length;

    for (let i = 0; i < total; i++) {
      const isbn = isbns[i].trim();
      if (!isbn) continue;

      const book = await BookScraper.scrapeByIsbn(isbn);
      if (book) {
        results.push(book);
        if (onProgress) {
          onProgress(i + 1, total, book.title);
        }
      }

      // Avoid API throttling
      await new Promise((r) => setTimeout(r, 120));
    }

    return results;
  }

  /**
   * Ingests scraped results into both the local store and the PostgreSQL database
   */
  public static async ingestToLibrary(scraped: ScrapedBookResult[]): Promise<number> {
    let ingestedCount = 0;

    for (const s of scraped) {
      const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `volume-${Date.now()}`;
      const authorSlug = s.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newBook: Omit<Book, 'id'> = {
        slug,
        title: s.title,
        author: s.author,
        authorSlug,
        year: s.year || new Date().getFullYear(),
        genre: s.genre || 'Literature',
        pages: s.pages || 250,
        currentPage: 0,
        rating: s.rating || 0,
        status: 'want_to_read',
        coverImage: s.coverImage,
        coverColor: '#111111',
        colorIndex: Math.abs(slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 12,
        synopsis: s.synopsis,
        review: '',
        notes: '',
        readOnlineUrl: s.readOnlineUrl,
        previewUrl: s.previewUrl,
        downloadUrl: s.downloadUrl,
        downloadPdfUrl: s.downloadPdfUrl,
        downloadEpubUrl: s.downloadEpubUrl,
        isPublicDomain: s.isPublicDomain,
        openSourceProvider: s.openSourceProvider,
      };

      LibraryStore.addBook(newBook);
      ingestedCount++;
    }

    // Mirror to PostgreSQL schema
    try {
      await DatabaseClient.insertScrapedBooks(scraped.map((s) => ({
        title: s.title,
        titleFr: s.titleFr,
        author: s.author,
        year: s.year,
        genre: s.genre,
        genreFr: s.genreFr,
        pages: s.pages,
        coverImage: s.coverImage,
        synopsis: s.synopsis,
        synopsisFr: s.synopsisFr,
      })));
    } catch (e) {
      console.warn('[BatchScraper] PostgreSQL mirror skipped:', e);
    }

    return ingestedCount;
  }
}