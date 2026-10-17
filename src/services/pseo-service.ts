import { BookRecord } from '../lib/db';

export interface PseoTemplate {
  key: string;
  name: string;
  titleEn: string;
  titleFr: string;
  descEn: string;
  descFr: string;
  h1En: string;
  h1Fr: string;
}

export interface RenderedPseoPage {
  slug: string;
  urlEn: string;
  urlFr: string;
  titleEn: string;
  titleFr: string;
  metaDescEn: string;
  metaDescFr: string;
  h1En: string;
  h1Fr: string;
  schemaJsonLd: string;
  lastMod: string;
}

const DEFAULT_TEMPLATES: Record<string, PseoTemplate> = {
  book: {
    key: 'book',
    name: 'Book Detail Pages',
    titleEn: '{title} by {author} – Summary, Reading Time & Notes | BookSearch',
    titleFr: '{title} par {author} – Résumé, Temps de lecture et Fiche | BookSearch',
    descEn: 'Discover {title} by {author}. Detailed book analysis, {pages} pages summary, key quotes, reading tracker, and reader insights.',
    descFr: 'Découvrez {title} de {author}. Analyse détaillée, résumé de {pages} pages, citations majeures, suivi de lecture et avis.',
    h1En: '{title}',
    h1Fr: '{title}',
  },
  author: {
    key: 'author',
    name: 'Author Bibliographies',
    titleEn: 'All Books by {author} – Reading Order & Ratings | BookSearch',
    titleFr: 'Tous les livres de {author} – Bibliographie et Ordre de lecture | BookSearch',
    descEn: 'Explore all published volumes by {author}. Chronological reading list, average book ratings, and literary overview.',
    descFr: 'Explorez la bibliographie complète de {author}. Ordre chronologique de lecture, notes moyennes et vue d’ensemble.',
    h1En: 'Books by {author}',
    h1Fr: 'Livres écrits par {author}',
  },
  genre: {
    key: 'genre',
    name: 'Genre & Subject Hubs',
    titleEn: 'Best {genre} Books to Read in 2026 | BookSearch',
    titleFr: 'Les Meilleurs Livres de {genre} à lire en 2026 | BookSearch',
    descEn: 'Curated list of the highest-rated {genre} books. Compare page counts, reviews, and reading notes.',
    descFr: 'Sélection des meilleurs livres du genre {genre}. Comparez le nombre de pages, critiques et avis.',
    h1En: 'Best {genre} Books',
    h1Fr: 'Meilleurs Livres : {genre}',
  },
};

const TEMPLATES_STORAGE_KEY = 'bookplate_pseo_templates';

export class PseoService {
  public static getTemplates(): Record<string, PseoTemplate> {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_TEMPLATES, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES;
  }

  public static saveTemplates(templates: Record<string, PseoTemplate>): void {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // ignore
    }
  }

  public static renderBookPage(book: BookRecord, baseUrl = 'https://booksearch.eu'): RenderedPseoPage {
    const templates = this.getTemplates();
    const t = templates.book || DEFAULT_TEMPLATES.book;

    const vars: Record<string, string> = {
      title: book.title || 'Untitled',
      author: book.author || 'Unknown',
      genre: book.genre || 'Literature',
      pages: book.pages ? String(book.pages) : '280',
      year: book.year ? String(book.year) : '2026',
    };

    const replaceVars = (str: string) =>
      Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v), str);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: {
        '@type': 'Person',
        name: book.author,
      },
      numberOfPages: book.pages || undefined,
      genre: book.genre || 'Literature',
      datePublished: book.year ? `${book.year}-01-01` : undefined,
      image: book.coverImage || undefined,
      description: book.synopsis || undefined,
      aggregateRating: book.rating > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: book.rating,
        bestRating: 5,
        ratingCount: 1,
      } : undefined,
    };

    return {
      slug: book.slug,
      urlEn: `${baseUrl}/en/books/${book.slug}`,
      urlFr: `${baseUrl}/fr/livres/${book.slug}`,
      titleEn: replaceVars(t.titleEn),
      titleFr: replaceVars(t.titleFr),
      metaDescEn: replaceVars(t.descEn),
      metaDescFr: replaceVars(t.descFr),
      h1En: replaceVars(t.h1En),
      h1Fr: replaceVars(t.h1Fr),
      schemaJsonLd: JSON.stringify(schema),
      lastMod: (book.updatedAt || new Date().toISOString()).split('T')[0],
    };
  }

  public static batchGenerate(books: BookRecord[], baseUrl = 'https://booksearch.eu'): RenderedPseoPage[] {
    return books.map((b) => this.renderBookPage(b, baseUrl));
  }
}