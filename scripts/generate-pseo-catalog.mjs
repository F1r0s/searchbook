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
];

const AUTHORS = [
  'Marcus Aurelius', 'Seneca', 'Epictetus', 'Plato', 'Aristotle',
  'Friedrich Nietzsche', 'Albert Camus', 'Fyodor Dostoevsky', 'Leo Tolstoy',
  'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Franz Kafka',
  'Arthur Conan Doyle', 'Oscar Wilde', 'Ernest Hemingway', 'F. Scott Fitzgerald',
  'Sun Tzu', 'Niccolò Machiavelli', 'Henry David Thoreau', 'Ralph Waldo Emerson',
  'Carl Sagan', 'Stephen Hawking', 'Charles Darwin', 'Adam Smith',
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

const existingSlugs = new Set(existingBooks.map((b) => b.slug));
const generatedEntries = [...existingBooks];

for (const author of AUTHORS) {
  for (const topic of TOPICS) {
    const title = `Essential ${topic} Treatises of ${author}`;
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
      coverImage: `https://covers.openlibrary.org/b/id/10313767-L.jpg`,
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

fs.writeFileSync(currentCatalogPath, JSON.stringify(generatedEntries, null, 2), 'utf8');

const srcCatalogPath = path.resolve('src', 'data', 'public-books.json');
if (fs.existsSync(path.dirname(srcCatalogPath))) {
  fs.writeFileSync(srcCatalogPath, JSON.stringify(generatedEntries, null, 2), 'utf8');
}

console.log(`Successfully compiled ${generatedEntries.length} total indexable volumes into public/books.json!`);