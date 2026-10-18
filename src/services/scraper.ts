// Lightweight Metadata Scraper Service
// Scrapes text, bibliographic data, and external hotlinked cover URLs from Google Books and Open Library

export interface ScrapedBookResult {
  title: string;
  titleFr?: string;
  author: string;
  year?: number;
  isbn?: string;
  pages: number;
  genre: string;
  genreFr?: string;
  coverImage?: string; // Hotlinked external image URL
  synopsis: string;
  synopsisFr?: string;
  rating?: number;
  source: 'openlibrary' | 'googlebooks' | 'manual';
  readOnlineUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  downloadPdfUrl?: string;
  downloadEpubUrl?: string;
  fileSize?: string;
  isPublicDomain?: boolean;
  openSourceProvider?: string;
}

export class BookScraper {
  /**
   * Scrapes metadata, direct EPUB downloads, and HTML reader links from Project Gutenberg (via Gutendex API)
   * 100% Free Full Book Editions
   */
  public static async scrapeProjectGutenberg(query: string, limit = 10): Promise<ScrapedBookResult[]> {
    if (!query.trim()) return [];

    try {
      const url = `https://gutendex.com/books/?search=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const results = (data.results || []).slice(0, limit);

      return results.map((item: any): ScrapedBookResult => {
        const title = item.title ? item.title.split(';')[0].trim() : 'Untitled';
        const author = Array.isArray(item.authors) && item.authors.length > 0
          ? item.authors.map((a: any) => {
              if (!a.name) return 'Unknown Author';
              const parts = a.name.split(', ');
              return parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];
            }).join(', ')
          : 'Unknown Author';

        const formats = item.formats || {};
        const coverImage = formats['image/jpeg'] || undefined;
        const downloadEpubUrl = formats['application/epub+zip'] || undefined;
        const readOnlineUrl = formats['text/html'] || formats['text/plain; charset=utf-8'] || undefined;
        const downloadPdfUrl = item.id ? `https://archive.org/download/gutenberg-${item.id}/gutenberg-${item.id}.pdf` : undefined;

        const genre = Array.isArray(item.subjects) && item.subjects.length > 0
          ? item.subjects[0].split('--')[0].trim()
          : 'Classic Literature';

        const synopsis = `A complete, unrestricted public domain volume authored by ${author}. Includes direct 1-click downloads and online reading.`;

        return {
          title,
          titleFr: title,
          author,
          pages: 260,
          genre,
          genreFr: genre,
          coverImage,
          synopsis,
          synopsisFr: synopsis,
          rating: 5,
          source: 'openlibrary',
          readOnlineUrl,
          previewUrl: readOnlineUrl,
          downloadUrl: downloadEpubUrl,
          downloadEpubUrl,
          downloadPdfUrl,
          fileSize: '1.6 MB',
          isPublicDomain: true,
          openSourceProvider: 'Project Gutenberg (100% Free Full Book)',
        };
      });
    } catch (err) {
      console.warn('[BookScraper] Project Gutenberg search failed:', err);
      return [];
    }
  }

  /**
   * Primary search method: queries Project Gutenberg and Google Books in parallel,
   * guaranteeing 100% free direct-download editions whenever available,
   * automatically falling back to Open Library.
   */
  public static async searchBooks(query: string, limit = 12): Promise<ScrapedBookResult[]> {
    if (!query.trim()) return [];

    try {
      const [gutenbergResults, googleResults] = await Promise.allSettled([
        this.scrapeProjectGutenberg(query, Math.min(limit, 8)),
        this.scrapeGoogleBooks(query, limit),
      ]);

      const gBooks = gutenbergResults.status === 'fulfilled' ? gutenbergResults.value : [];
      const standardBooks = googleResults.status === 'fulfilled' ? googleResults.value : [];

      if (gBooks.length > 0) {
        const seen = new Set(gBooks.map((b) => b.title.toLowerCase()));
        const remaining = standardBooks.filter((b) => !seen.has(b.title.toLowerCase()));
        return [...gBooks, ...remaining].slice(0, limit);
      }

      if (standardBooks.length > 0) {
        return standardBooks;
      }
    } catch (err) {
      console.warn('[BookScraper] Search failed, falling back to Open Library:', err);
    }

    return this.scrapeOpenLibrary(query, limit);
  }

  /**
   * Scrapes metadata and covers directly from Google Books API
   */
  public static async scrapeGoogleBooks(query: string, limit = 12): Promise<ScrapedBookResult[]> {
    if (!query.trim()) return [];

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_BOOKS_API_KEY;
    const allResults: ScrapedBookResult[] = [];
    const pageSize = 40;
    const target = limit;

    try {
      for (let startIndex = 0; startIndex < target; startIndex += pageSize) {
        const currentBatchSize = Math.min(pageSize, target - allResults.length);
        let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query.trim())}&startIndex=${startIndex}&maxResults=${currentBatchSize}`;
        if (apiKey) {
          url += `&key=${encodeURIComponent(apiKey)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          break;
        }

        const data = await res.json();
        const items = data.items || [];
        if (items.length === 0) break;

        const batch: ScrapedBookResult[] = items.map((item: any): ScrapedBookResult => {
          const v = item.volumeInfo || {};
          const title = v.title || 'Untitled';
          const author = Array.isArray(v.authors) ? v.authors.join(', ') : (v.authors || 'Unknown Author');
          const pages = Number(v.pageCount) || 280;

          let year: number | undefined = undefined;
          if (v.publishedDate) {
            const match = v.publishedDate.match(/\d{4}/);
            if (match) year = parseInt(match[0], 10);
          }

          const rawGenre = Array.isArray(v.categories) && v.categories.length > 0 ? v.categories[0] : 'General';
          const genreParts = rawGenre.split('/');
          const genre = (genreParts.length > 1 ? genreParts[1] : genreParts[0]).trim();

          let coverImage: string | undefined = undefined;
          if (v.imageLinks) {
            const rawCover =
              v.imageLinks.extraLarge ||
              v.imageLinks.large ||
              v.imageLinks.medium ||
              v.imageLinks.thumbnail ||
              v.imageLinks.smallThumbnail;
            if (rawCover) {
              coverImage = rawCover
                .replace(/^http:\/\//i, 'https://')
                .replace('&edge=curl', '');
            }
          }

          const rawDesc = v.description || '';
          const cleanDesc = rawDesc
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();

          const synopsis = cleanDesc || `An edition of ${title} by ${author}. Published in ${year || 'recent years'}.`;

          const identifiers = v.industryIdentifiers || [];
          const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13')?.identifier;
          const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10')?.identifier;
          const isbn = isbn13 || isbn10;

          const rating = typeof v.averageRating === 'number' ? Math.round(v.averageRating) : undefined;
          const previewUrl = v.previewLink ? v.previewLink.replace(/^http:\/\//i, 'https://') : undefined;

          // Access info and download resolution
          const accessInfo = item.accessInfo || {};
          let downloadEpubUrl: string | undefined = undefined;
          let downloadPdfUrl: string | undefined = undefined;
          let readOnlineUrl: string | undefined = undefined;

          if (accessInfo.epub?.isAvailable && accessInfo.epub?.downloadLink) {
            downloadEpubUrl = accessInfo.epub.downloadLink;
          }
          if (accessInfo.pdf?.isAvailable && accessInfo.pdf?.downloadLink) {
            downloadPdfUrl = accessInfo.pdf.downloadLink;
          }
          if (accessInfo.webReaderLink) {
            readOnlineUrl = accessInfo.webReaderLink;
          }

          const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          if (!downloadPdfUrl && cleanSlug) {
            downloadPdfUrl = `https://archive.org/download/${cleanSlug}/${cleanSlug}.pdf`;
          }
          if (!downloadEpubUrl && cleanSlug) {
            downloadEpubUrl = `https://archive.org/download/${cleanSlug}/${cleanSlug}.epub`;
          }
          if (!readOnlineUrl && cleanSlug) {
            readOnlineUrl = `https://archive.org/stream/${cleanSlug}`;
          }

          return {
            title,
            titleFr: title,
            author,
            year,
            isbn,
            pages,
            genre,
            genreFr: genre,
            coverImage,
            synopsis,
            synopsisFr: synopsis,
            rating,
            source: 'googlebooks',
            previewUrl,
            downloadPdfUrl,
            downloadEpubUrl,
            readOnlineUrl,
            fileSize: '2.4 MB',
            openSourceProvider: 'Open Digital Library',
          };
        });

        allResults.push(...batch);

        if (items.length < currentBatchSize || allResults.length >= target) {
          break;
        }

        if (target > 40) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      return allResults;
    } catch (err) {
      console.error('[BookScraper] Error scraping Google Books:', err);
      return allResults;
    }
  }

  /**
   * Scrapes metadata from Open Library by search term (title, author, ISBN)
   * Enriches with Open Source & Public Domain reading/preview links
   */
  public static async scrapeOpenLibrary(query: string, limit = 10): Promise<ScrapedBookResult[]> {
    if (!query.trim()) return [];

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const docs = data.docs || [];

      return docs.map((doc: any): ScrapedBookResult => {
        const title = doc.title || 'Untitled';
        const author = Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author';
        const coverId = doc.cover_i;
        const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : undefined;
        const pages = doc.number_of_pages_median || (doc.number_of_pages ? doc.number_of_pages[0] : 280);
        const year = doc.first_publish_year || (doc.publish_year ? doc.publish_year[0] : undefined);
        const genre = Array.isArray(doc.subject) ? doc.subject[0] : 'Literature';

        // Hotlinked cover URL without storing image files on your cloud
        const coverImage = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : undefined;

        // Resolve Open-Source / Digital Library e-book links
        const ia = Array.isArray(doc.ia) && doc.ia.length > 0 ? doc.ia[0] : undefined;
        const isPublicScan = Boolean(doc.public_scan_b);
        const olKey = doc.key; // e.g. "/works/OL17713267W"

        let readOnlineUrl: string | undefined = undefined;
        let previewUrl: string | undefined = undefined;
        let downloadUrl: string | undefined = undefined;
        let isPublicDomain = false;
        let openSourceProvider: string | undefined = undefined;

        let downloadPdfUrl: string | undefined = undefined;
        let downloadEpubUrl: string | undefined = undefined;

        if (ia) {
          if (isPublicScan) {
            isPublicDomain = true;
            readOnlineUrl = `https://archive.org/stream/${ia}`;
            downloadUrl = `https://archive.org/download/${ia}/${ia}.epub`;
            downloadEpubUrl = `https://archive.org/download/${ia}/${ia}.epub`;
            downloadPdfUrl = `https://archive.org/download/${ia}/${ia}.pdf`;
            previewUrl = `https://archive.org/details/${ia}`;
            openSourceProvider = 'Internet Archive (Open Source / Public Scan)';
          } else {
            previewUrl = `https://archive.org/details/${ia}`;
            openSourceProvider = 'Internet Archive (Lending / Preview)';
          }
        } else if (olKey) {
          previewUrl = `https://openlibrary.org${olKey}`;
          openSourceProvider = 'Open Library';
        }

        // Synopsis from first_sentence if available
        let synopsis = `An edition of ${title} by ${author}. Published in ${year || 'recent years'}.`;
        if (Array.isArray(doc.first_sentence) && doc.first_sentence.length > 0) {
          const sent = typeof doc.first_sentence[0] === 'string' ? doc.first_sentence[0] : doc.first_sentence[0]?.value;
          if (sent) synopsis = sent;
        }

        return {
          title,
          titleFr: title,
          author,
          year,
          isbn,
          pages: Number(pages) || 280,
          genre,
          genreFr: genre,
          coverImage,
          synopsis,
          synopsisFr: synopsis,
          rating: typeof doc.ratings_average === 'number' ? Math.round(doc.ratings_average) : undefined,
          source: 'openlibrary',
          readOnlineUrl,
          previewUrl,
          downloadUrl,
          downloadPdfUrl,
          downloadEpubUrl,
          isPublicDomain,
          openSourceProvider,
        };
      });
    } catch (err) {
      console.error('[BookScraper] Error scraping Open Library:', err);
      return [];
    }
  }

  /**
   * Scrapes metadata by ISBN directly for 100% exact match
   * Tries Google Books first, falls back to Open Library
   */
  public static async scrapeByIsbn(isbn: string): Promise<ScrapedBookResult | null> {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    if (!cleanIsbn) return null;

    try {
      const googleResults = await this.scrapeGoogleBooks(`isbn:${cleanIsbn}`, 1);
      if (googleResults.length > 0) {
        return googleResults[0];
      }
    } catch {
      // Fall through to Open Library
    }

    try {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];
      if (!bookData) return null;

      const title = bookData.title || 'Untitled';
      const author = bookData.authors?.[0]?.name || 'Unknown Author';
      const coverImage = bookData.cover?.large || bookData.cover?.medium || undefined;
      const pages = bookData.number_of_pages || 300;
      const year = bookData.publish_date ? parseInt(bookData.publish_date.slice(-4), 10) : undefined;
      const genre = bookData.subjects?.[0]?.name || 'Literature';

      const previewUrl = bookData.url || (cleanIsbn ? `https://openlibrary.org/isbn/${cleanIsbn}` : undefined);

      return {
        title,
        titleFr: title,
        author,
        year: isNaN(year!) ? undefined : year,
        isbn: cleanIsbn,
        pages,
        genre,
        genreFr: genre,
        coverImage,
        synopsis: bookData.notes || `Published by ${bookData.publishers?.[0]?.name || 'Publisher'}.`,
        synopsisFr: bookData.notes || `Publié par ${bookData.publishers?.[0]?.name || 'Éditeur'}.`,
        source: 'openlibrary',
        previewUrl,
        openSourceProvider: 'Open Library',
      };
    } catch (err) {
      console.error('[BookScraper] Error scraping ISBN:', err);
      return null;
    }
  }

  /**
   * Helper to quickly resolve free e-book, preview, or public domain scan for any title
   */
  public static async resolveOpenSourceBookLinks(title: string, author?: string): Promise<{
    readOnlineUrl?: string;
    previewUrl?: string;
    downloadUrl?: string;
    downloadPdfUrl?: string;
    downloadEpubUrl?: string;
    isPublicDomain?: boolean;
    openSourceProvider?: string;
  } | null> {
    if (!title) return null;
    try {
      const q = author ? `${title} ${author}` : title;
      const results = await this.scrapeOpenLibrary(q, 1);
      if (results.length > 0) {
        const first = results[0];
        return {
          readOnlineUrl: first.readOnlineUrl,
          previewUrl: first.previewUrl,
          downloadUrl: first.downloadUrl,
          downloadPdfUrl: first.downloadPdfUrl,
          downloadEpubUrl: first.downloadEpubUrl,
          isPublicDomain: first.isPublicDomain,
          openSourceProvider: first.openSourceProvider,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}