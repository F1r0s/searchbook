// Database adapter for PostgreSQL with resilient memory fallback
export interface DatabaseConfig {
  connectionString?: string;
}

export interface BookRecord {
  id: string;
  slug: string;
  title: string;
  titleFr?: string;
  author: string;
  authorSlug: string;
  isbn?: string;
  year?: number;
  genre: string;
  genreFr?: string;
  pages: number;
  currentPage: number;
  rating: number;
  status: 'finished' | 'reading' | 'want_to_read' | 'dnf';
  startedDate?: string;
  finishedDate?: string;
  coverImage?: string;
  coverColor?: string;
  colorIndex: number;
  synopsis?: string;
  synopsisFr?: string;
  review?: string;
  notes?: string;
  notesFr?: string;
  isCurated: boolean;
  isPseoPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory mirror for local offline operation when DATABASE_URL is not yet configured
let memoryBooks: BookRecord[] = [];

export class DatabaseClient {
  private static connectionString: string = (() => {
    const g = globalThis as any;
    return g?.process?.env?.DATABASE_URL || (import.meta as any)?.env?.VITE_DATABASE_URL || '';
  })();

  public static isConnected(): boolean {
    return Boolean(this.connectionString && !this.connectionString.includes('localhost:5432/booksearch'));
  }

  public static async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    if (typeof window !== 'undefined' || !this.connectionString) {
      return [];
    }

    try {
      // Dynamic import for server environment (pg or neon driver)
      const moduleName = 'pg';
      const { Pool } = await import(/* @vite-ignore */ moduleName);
      const isProd = (globalThis as any)?.process?.env?.NODE_ENV === 'production';
      const pool = new Pool({ connectionString: this.connectionString, ssl: isProd ? { rejectUnauthorized: false } : undefined });
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return result.rows as T[];
      } finally {
        client.release();
        await pool.end();
      }
    } catch (err) {
      console.warn('[Database] Query fallback to memory store:', err);
      return [];
    }
  }

  public static async getBooks(options?: { status?: string; search?: string; pseoOnly?: boolean }): Promise<BookRecord[]> {
    if (this.isConnected()) {
      let sql = 'SELECT * FROM books WHERE 1=1';
      const params: any[] = [];
      if (options?.status && options.status !== 'all') {
        params.push(options.status);
        sql += ` AND status = $${params.length}`;
      }
      if (options?.pseoOnly) {
        sql += ' AND is_pseo_published = true';
      }
      if (options?.search) {
        params.push(`%${options.search.toLowerCase()}%`);
        sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(author) LIKE $${params.length})`;
      }
      sql += ' ORDER BY created_at DESC';
      const rows = await this.executeQuery(sql, params);
      if (rows.length > 0) return rows;
    }
    return memoryBooks;
  }

  public static async insertScrapedBooks(books: Array<Partial<BookRecord>>): Promise<number> {
    let inserted = 0;
    for (const b of books) {
      const record: BookRecord = {
        id: b.id || `book-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        slug: b.slug || (b.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        title: b.title || 'Untitled',
        titleFr: b.titleFr || b.title,
        author: b.author || 'Unknown',
        authorSlug: (b.author || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        isbn: b.isbn,
        year: b.year || new Date().getFullYear(),
        genre: b.genre || 'Literature',
        genreFr: b.genreFr || 'Littérature',
        pages: b.pages || 0,
        currentPage: 0,
        rating: b.rating || 0,
        status: b.status || 'want_to_read',
        coverImage: b.coverImage,
        coverColor: b.coverColor,
        colorIndex: b.colorIndex ?? 0,
        synopsis: b.synopsis || '',
        synopsisFr: b.synopsisFr || b.synopsis || '',
        review: b.review || '',
        notes: b.notes || '',
        isCurated: b.isCurated ?? false,
        isPseoPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (this.isConnected()) {
        const query = `
          INSERT INTO books (
            id, slug, title, title_fr, author, author_slug, isbn, year, genre, genre_fr,
            pages, current_page, rating, status, cover_image, color_index, synopsis, synopsis_fr,
            is_curated, is_pseo_published
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
          ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        `;
        const params = [
          record.id, record.slug, record.title, record.titleFr, record.author, record.authorSlug,
          record.isbn, record.year, record.genre, record.genreFr, record.pages, record.currentPage,
          record.rating, record.status, record.coverImage, record.colorIndex, record.synopsis,
          record.synopsisFr, record.isCurated, record.isPseoPublished,
        ];
        await this.executeQuery(query, params);
      } else {
        const existingIdx = memoryBooks.findIndex((m) => m.slug === record.slug);
        if (existingIdx >= 0) {
          memoryBooks[existingIdx] = record;
        } else {
          memoryBooks.unshift(record);
        }
      }
      inserted++;
    }
    return inserted;
  }
}