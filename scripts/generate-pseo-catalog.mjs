// High-Speed Script: Bulk Programmatic SEO Catalog Generator
// Generates thousands of indexable literary entries for sitemap partitions without cloud asset storage

import fs from 'fs';
import path from 'path';

const TOPICS = [
  'Philosophy',
  'Stoicism',
  'Psychology',
  'Self-Help',
  'Productivity',
  'Classic Literature',
  'Dystopian Fiction',
  'Science Fiction',
  'History',
  'Biography',
  'Political Economy',
  'Ethics',
  'Metaphysics',
  'Cognitive Science',
  'Existentialism',
  'Natural History',
  'Logic & Rhetoric',
  'Sociology',
  'Epistemology',
  'Literary Criticism',
];

const EDITIONS = [
  'Essential Treatises',
  'Collected Works',
  'Complete Lectures',
  'Critical Anthology',
  'Foundational Essays',
];

const AUTHORS = [
  'Marcus Aurelius', 'Seneca', 'Epictetus', 'Plato', 'Aristotle',
  'Friedrich Nietzsche', 'Albert Camus', 'Fyodor Dostoevsky', 'Leo Tolstoy',
  'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Franz Kafka',
  'Arthur Conan Doyle', 'Oscar Wilde', 'Ernest Hemingway', 'F. Scott Fitzgerald',
  'Sun Tzu', 'Niccolò Machiavelli', 'Henry David Thoreau', 'Ralph Waldo Emerson',
  'Carl Sagan', 'Stephen Hawking', 'Charles Darwin', 'Adam Smith',
  'Immanuel Kant', 'Baruch Spinoza', 'René Descartes', 'John Locke', 'David Hume',
  'Søren Kierkegaard', 'Arthur Schopenhauer', 'Jean-Jacques Rousseau', 'Voltaire', 'Michel de Montaigne',
];

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

console.log('Generating automated pSEO catalog entries for Google search ranking...');

const currentCatalogPath = path.resolve('public', 'books.json');
let existingBooks = [];

if (fs.existsSync(currentCatalogPath)) {
  try {
    existingBooks = JSON.parse(fs.readFileSync(currentCatalogPath, 'utf8'));
  } catch {
    existingBooks = [];
  }
}

const cleanExistingBooks = existingBooks.filter((b) => Boolean(b && b.slug && b.id));
const existingSlugs = new Set(cleanExistingBooks.map((b) => b.slug));
const generatedEntries = [...cleanExistingBooks];

for (const author of AUTHORS) {
  for (const topic of TOPICS) {
    for (const edition of EDITIONS) {
      const title = `${edition} on ${topic} by ${author}`;
      const slug = slugify(title);

    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    generatedEntries.push({
      id: slug,
      slug,
      title,
      author,
      authorSlug: slugify(author),
      year: 2026,
      genre: topic,
      pages: 320,
      rating: 4.8,
      status: 'want_to_read',
      colorIndex: Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 12,
      synopsis: `An essential open-access volume on ${topic} featuring foundational insights and curated reflections by ${author}.`,
      downloadPdfUrl: `https://archive.org/download/${slug}/${slug}.pdf`,
      downloadEpubUrl: `https://archive.org/download/${slug}/${slug}.epub`,
      readOnlineUrl: `https://archive.org/stream/${slug}`,
      fileSize: '2.4 MB',
      isPublicDomain: true,
      openSourceProvider: 'Open Digital Archives',
    });
    }
  }
}

fs.writeFileSync(currentCatalogPath, JSON.stringify(generatedEntries, null, 2), 'utf8');

const srcCatalogPath = path.resolve('src', 'data', 'public-books.json');
if (fs.existsSync(path.dirname(srcCatalogPath))) {
  fs.writeFileSync(srcCatalogPath, JSON.stringify(generatedEntries, null, 2), 'utf8');
}

console.log(`Successfully compiled ${generatedEntries.length} total indexable volumes into public/books.json!`);