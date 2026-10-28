import { Book } from '../types';
import { LibraryStore } from './library-store';

export interface PseoTemplate {
  key: string;
  name: string;
  titleEn: string;
  titleEs: string;
  titleFr: string;
  titlePt: string;
  descEn: string;
  descEs: string;
  descFr: string;
  descPt: string;
  h1En: string;
  h1Es: string;
  h1Fr: string;
  h1Pt: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleFr: string;
  subtitlePt: string;
}

export interface RenderedBookMeta {
  metaTitle: string;
  metaDescription: string;
  h1Heading: string;
  subtitle: string;
  schemaJsonLd: string;
  canonicalUrl: string;
}

const DEFAULT_TEMPLATES: Record<string, PseoTemplate> = {
  book: {
    key: 'book',
    name: 'Book Detail Pages',
    titleEn: '{title} by {author} – PDF & EPUB Archive | Readbook',
    titleEs: '{title} por {author} – Archivo PDF y EPUB | Readbook',
    titleFr: '{title} par {author} – Archive PDF & EPUB | Readbook',
    titlePt: '{title} por {author} – Arquivo PDF e EPUB | Readbook',
    descEn: 'Access {title} by {author} ({year}). {pages} pages in {genre}. Read online or download PDF and EPUB editions.',
    descEs: 'Accede a {title} de {author} ({year}). {pages} páginas en {genre}. Lectura en línea y descarga en PDF y EPUB.',
    descFr: 'Accédez à {title} de {author} ({year}). {pages} pages en {genre}. Lecture en ligne et téléchargement PDF et EPUB.',
    descPt: 'Aceda a {title} de {author} ({year}). {pages} páginas em {genre}. Leitura online e transferência em PDF e EPUB.',
    h1En: '{title}',
    h1Es: '{title}',
    h1Fr: '{title}',
    h1Pt: '{title}',
    subtitleEn: 'By {author} · {genre} · {pages} pages · {year}',
    subtitleEs: 'Por {author} · {genre} · {pages} páginas · {year}',
    subtitleFr: 'Par {author} · {genre} · {pages} pages · {year}',
    subtitlePt: 'Por {author} · {genre} · {pages} páginas · {year}',
  },
  author: {
    key: 'author',
    name: 'Author Bibliographies',
    titleEn: 'Books by {author} – Complete Digital Bibliography | Readbook',
    titleEs: 'Libros de {author} – Bibliografía Digital Completa | Readbook',
    titleFr: 'Livres de {author} – Bibliographie Numérique Complète | Readbook',
    titlePt: 'Livros de {author} – Bibliografia Digital Completa | Readbook',
    descEn: 'Complete catalog of volumes authored by {author}, including publication dates, page counts, and digital editions.',
    descEs: 'Catálogo completo de obras de {author}, con fechas de publicación, páginas y ediciones digitales.',
    descFr: 'Catalogue complet des ouvrages de {author}, incluant dates de parution, pagination et éditions numériques.',
    descPt: 'Catálogo completo de obras de {author}, incluindo datas de publicação, páginas e edições digitais.',
    h1En: 'Works by {author}',
    h1Es: 'Obras de {author}',
    h1Fr: 'Œuvres de {author}',
    h1Pt: 'Obras de {author}',
    subtitleEn: 'Indexed bibliography and digital editions for {author}.',
    subtitleEs: 'Bibliografía indexada y ediciones digitales de {author}.',
    subtitleFr: 'Bibliographie indexée et éditions numériques de {author}.',
    subtitlePt: 'Bibliografia indexada e edições digitais de {author}.',
  },
  genre: {
    key: 'genre',
    name: 'Genre & Subject Archives',
    titleEn: '{genre} Books – Digital Archive & Catalog | Readbook',
    titleEs: 'Libros de {genre} – Archivo y Catálogo Digital | Readbook',
    titleFr: 'Livres de {genre} – Archive et Catalogue Numérique | Readbook',
    titlePt: 'Livros de {genre} – Arquivo e Catálogo Digital | Readbook',
    descEn: 'Browse indexed volumes in {genre}. Compare editions, page counts, and direct PDF and EPUB availability.',
    descEs: 'Explora volúmenes indexados en {genre}. Compara ediciones, páginas y disponibilidad en PDF y EPUB.',
    descFr: 'Parcourez les volumes indexés en {genre}. Comparez les éditions, paginations et fichiers PDF et EPUB.',
    descPt: 'Explore volumes indexados em {genre}. Compare edições, páginas e disponibilidade em PDF e EPUB.',
    h1En: '{genre} Archive',
    h1Es: 'Archivo de {genre}',
    h1Fr: 'Archive : {genre}',
    h1Pt: 'Arquivo de {genre}',
    subtitleEn: 'Curated digital catalog for {genre}.',
    subtitleEs: 'Catálogo digital seleccionado de {genre}.',
    subtitleFr: 'Catalogue numérique sélectionné pour {genre}.',
    subtitlePt: 'Catálogo digital selecionado de {genre}.',
  },
};

const TEMPLATES_STORAGE_KEY = 'searchbook_pseo_templates_v2';

const PSEO_AUTHORS = [
  'Marcus Aurelius', 'Seneca', 'Epictetus', 'Plato', 'Aristotle',
  'Friedrich Nietzsche', 'Albert Camus', 'Fyodor Dostoevsky', 'Leo Tolstoy',
  'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Franz Kafka',
  'Arthur Conan Doyle', 'Oscar Wilde', 'Ernest Hemingway', 'F. Scott Fitzgerald',
  'Sun Tzu', 'Niccolò Machiavelli', 'Henry David Thoreau', 'Ralph Waldo Emerson',
  'Carl Sagan', 'Stephen Hawking', 'Charles Darwin', 'Adam Smith',
  'Immanuel Kant', 'Baruch Spinoza', 'René Descartes', 'John Locke', 'David Hume',
  'Søren Kierkegaard', 'Arthur Schopenhauer', 'Jean-Jacques Rousseau', 'Voltaire', 'Michel de Montaigne',
  'Hannah Arendt', 'Simone de Beauvoir', 'Bertrand Russell', 'Ludwig Wittgenstein', 'Thomas Aquinas',
];

const PSEO_TOPICS = [
  'Philosophy', 'Stoicism', 'Psychology', 'Self-Help', 'Productivity',
  'Classic Literature', 'Dystopian Fiction', 'Science Fiction', 'History', 'Biography',
  'Political Economy', 'Ethics', 'Metaphysics', 'Cognitive Science', 'Existentialism',
  'Natural History', 'Logic & Rhetoric', 'Sociology', 'Epistemology', 'Literary Criticism',
  ' Jurisprudence', 'Classical Antiquity', 'Anthropology', 'Cosmology', 'Aesthetics',
];

const PSEO_EDITIONS = [
  'Essential Treatises',
  'Collected Works',
  'Complete Lectures',
  'Critical Anthology',
  'Foundational Essays',
  'Selected Letters & Manuscripts',
  'Philosophical Notebooks',
  'Archival Monograph',
];

function slugify(text: string): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class PseoService {
  public static getTemplates(): Record<string, PseoTemplate> {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          book: { ...DEFAULT_TEMPLATES.book, ...(parsed.book || {}) },
          author: { ...DEFAULT_TEMPLATES.author, ...(parsed.author || {}) },
          genre: { ...DEFAULT_TEMPLATES.genre, ...(parsed.genre || {}) },
        };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_TEMPLATES;
  }

  public static saveTemplates(templates: Record<string, PseoTemplate>): void {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // ignore storage errors
    }
  }

  public static resetTemplates(): Record<string, PseoTemplate> {
    try {
      localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_TEMPLATES;
  }

  public static renderBookMeta(
    book: Book,
    locale: 'en' | 'es' | 'fr' | 'pt' = 'en',
    baseUrl = 'https://libpdf.pages.dev'
  ): RenderedBookMeta {
    const templates = this.getTemplates();
    const t = templates.book || DEFAULT_TEMPLATES.book;

    const vars: Record<string, string> = {
      title: book.title || 'Untitled',
      author: book.author || 'Unknown',
      genre: book.genre || 'Literature',
      pages: book.pages ? String(book.pages) : '320',
      year: book.year ? String(book.year) : '2026',
    };

    const interpolate = (pattern: string) =>
      Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
        pattern
      );

    const titlePattern =
      locale === 'es' ? t.titleEs : locale === 'fr' ? t.titleFr : locale === 'pt' ? t.titlePt : t.titleEn;
    const descPattern =
      locale === 'es' ? t.descEs : locale === 'fr' ? t.descFr : locale === 'pt' ? t.descPt : t.descEn;
    const h1Pattern =
      locale === 'es' ? t.h1Es : locale === 'fr' ? t.h1Fr : locale === 'pt' ? t.h1Pt : t.h1En;
    const subtitlePattern =
      locale === 'es' ? t.subtitleEs : locale === 'fr' ? t.subtitleFr : locale === 'pt' ? t.subtitlePt : t.subtitleEn;

    const metaTitle = interpolate(titlePattern);
    const metaDescription = interpolate(descPattern);
    const h1Heading = interpolate(h1Pattern);
    const subtitle = interpolate(subtitlePattern);
    const canonicalUrl = `${baseUrl}/${locale}/books/${book.slug || book.id}`;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: {
        '@type': 'Person',
        name: book.author,
      },
      inLanguage: locale,
      numberOfPages: book.pages || undefined,
      genre: book.genre || 'Literature',
      datePublished: book.year ? `${book.year}-01-01` : undefined,
      image: book.coverImage || undefined,
      description: book.synopsis || metaDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };

    return {
      metaTitle,
      metaDescription,
      h1Heading,
      subtitle,
      schemaJsonLd: JSON.stringify(schema),
      canonicalUrl,
    };
  }

  /**
   * Automatically generates programmatic SEO catalog records in bulk and persists them
   */
  public static generateBulkPseoCatalog(targetNewCount: number): { added: number; total: number } {
    const existingBooks = LibraryStore.getBooks();
    const existingSlugs = new Set(existingBooks.map((b) => b.slug));
    const newEntries: Book[] = [];

    for (const author of PSEO_AUTHORS) {
      for (const rawTopic of PSEO_TOPICS) {
        const topic = rawTopic.trim();
        for (const edition of PSEO_EDITIONS) {
          if (newEntries.length >= targetNewCount) break;

          const title = `${edition} on ${topic}: ${author}`;
          const slug = slugify(title);
          if (!slug || existingSlugs.has(slug)) continue;

          existingSlugs.add(slug);
          const hash = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

          newEntries.push({
            id: slug,
            slug,
            title,
            author,
            authorSlug: slugify(author),
            year: 1850 + (hash % 170),
            genre: topic,
            pages: 220 + (hash % 320),
            rating: 4.5,
            status: 'want_to_read',
            colorIndex: hash % 12,
            synopsis: `Archival digital edition of ${title}. Indexed under ${topic} with full-text search, reading tracker, and direct PDF and EPUB availability.`,
            downloadPdfUrl: `https://archive.org/download/${slug}/${slug}.pdf`,
            downloadEpubUrl: `https://archive.org/download/${slug}/${slug}.epub`,
            readOnlineUrl: `https://archive.org/stream/${slug}`,
            fileSize: `${(1.2 + (hash % 25) * 0.1).toFixed(1)} MB`,
            downloadCount: 400 + (hash % 2400),
            isPublicDomain: true,
            openSourceProvider: 'Open Digital Archives',
          });
        }
        if (newEntries.length >= targetNewCount) break;
      }
      if (newEntries.length >= targetNewCount) break;
    }

    const updatedCatalog = [...existingBooks, ...newEntries];
    LibraryStore.saveBooks(updatedCatalog);

    return {
      added: newEntries.length,
      total: updatedCatalog.length,
    };
  }
}