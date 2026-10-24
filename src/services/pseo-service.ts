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
    titleEn: '{title} by {author} – Summary, Download EPUB/PDF & Read | Searchbook',
    titleFr: '{title} par {author} – Résumé, Téléchargement EPUB/PDF & Lecture | Searchbook',
    descEn: 'Discover {title} by {author}. Detailed book analysis, {pages} pages summary, key quotes, reading tracker, and reader insights.',
    descFr: 'Découvrez {title} de {author}. Analyse détaillée, résumé de {pages} pages, citations majeures, suivi de lecture et avis.',
    h1En: '{title}',
    h1Fr: '{title}',
  },
  author: {
    key: 'author',
    name: 'Author Bibliographies',
    titleEn: 'All Books by {author} – Digital Library & E-Books | Searchbook',
    titleFr: 'Tous les livres de {author} – Bibliothèque Numérique & E-Books | Searchbook',
    descEn: 'Explore all published volumes by {author}. Chronological reading list, average book ratings, and literary overview.',
    descFr: 'Explorez la bibliographie complète de {author}. Ordre chronologique de lecture, notes moyennes et vue d’ensemble.',
    h1En: 'Books by {author}',
    h1Fr: 'Livres écrits par {author}',
  },
  genre: {
    key: 'genre',
    name: 'Genre & Subject Hubs',
    titleEn: 'Download Free {genre} E-Books in EPUB & PDF | Searchbook',
    titleFr: 'Télécharger Livres de {genre} en EPUB & PDF | Searchbook',
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

  public static renderBookPage(book: BookRecord, baseUrl = 'https://searchbook.pages.dev'): RenderedPseoPage {
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
      urlFr: `${baseUrl}/fr/books/${book.slug}`,
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

  public static batchGenerate(books: BookRecord[], baseUrl = 'https://searchbook.pages.dev'): RenderedPseoPage[] {
    return books.map((b) => this.renderBookPage(b, baseUrl));
  }
}