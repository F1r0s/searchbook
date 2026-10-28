import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://libpdf.pages.dev';
const SITEMAP_CHUNK_SIZE = 1000;
const LOCALES = ['en', 'es', 'fr', 'pt'];

const today = new Date().toISOString().split('T')[0];

// Load books catalog
const booksPath = path.resolve('src', 'data', 'public-books.json');
const fallbackPath = path.resolve('public', 'books.json');
const rawBooks = fs.existsSync(booksPath)
  ? JSON.parse(fs.readFileSync(booksPath, 'utf8'))
  : fs.existsSync(fallbackPath)
  ? JSON.parse(fs.readFileSync(fallbackPath, 'utf8'))
  : [];

const validBooks = Array.isArray(rawBooks)
  ? rawBooks.filter((b) => Boolean(b && (b.slug || b.id) && String(b.slug || b.id).trim()))
  : [];

const chunkCount = Math.max(1, Math.ceil(validBooks.length / SITEMAP_CHUNK_SIZE));

// 1. Generate public/sitemap_static.xml
const sections = [
  { sub: '', priority: '1.0', changefreq: 'daily' },
  { sub: 'library', priority: '0.9', changefreq: 'daily' },
  { sub: 'features', priority: '0.8', changefreq: 'weekly' },
  { sub: 'vocab', priority: '0.7', changefreq: 'weekly' },
  { sub: 'stats', priority: '0.7', changefreq: 'weekly' },
  { sub: 'about', priority: '0.7', changefreq: 'monthly' },
  { sub: 'contact', priority: '0.6', changefreq: 'monthly' },
];

let staticXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
staticXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
staticXml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

staticXml += `  <url>\n`;
staticXml += `    <loc>${BASE_URL}</loc>\n`;
staticXml += `    <lastmod>${today}</lastmod>\n`;
staticXml += `    <changefreq>daily</changefreq>\n`;
staticXml += `    <priority>1.0</priority>\n`;
for (const altLang of LOCALES) {
  staticXml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}"/>\n`;
}
staticXml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en"/>\n`;
staticXml += `  </url>\n`;

for (const s of sections) {
  for (const lang of LOCALES) {
    const locPath = s.sub ? `${lang}/${s.sub}` : lang;
    const locUrl = `${BASE_URL}/${locPath}`;

    staticXml += `  <url>\n`;
    staticXml += `    <loc>${locUrl}</loc>\n`;
    staticXml += `    <lastmod>${today}</lastmod>\n`;
    staticXml += `    <changefreq>${s.changefreq}</changefreq>\n`;
    staticXml += `    <priority>${s.priority}</priority>\n`;

    for (const altLang of LOCALES) {
      const altPath = s.sub ? `${altLang}/${s.sub}` : altLang;
      staticXml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altPath}"/>\n`;
    }
    const defaultPath = s.sub ? `en/${s.sub}` : 'en';
    staticXml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${defaultPath}"/>\n`;
    staticXml += `  </url>\n`;
  }
}
staticXml += `</urlset>\n`;

fs.writeFileSync(path.resolve('public', 'sitemap_static.xml'), staticXml, 'utf8');

// 2. Generate public/sitemap.xml as a true <sitemapindex> and public/sitemap_1.xml..sitemap_N.xml chunks
let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
indexXml += `  <sitemap>\n`;
indexXml += `    <loc>${BASE_URL}/sitemap_static.xml</loc>\n`;
indexXml += `    <lastmod>${today}</lastmod>\n`;
indexXml += `  </sitemap>\n`;

for (let c = 1; c <= chunkCount; c++) {
  const start = (c - 1) * SITEMAP_CHUNK_SIZE;
  const chunkBooks = validBooks.slice(start, start + SITEMAP_CHUNK_SIZE);

  let bookXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  bookXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  bookXml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const b of chunkBooks) {
    const slug = String(b.slug || b.id || '').trim();
    if (!slug) continue;

    const bookUrl = `${BASE_URL}/books/${slug}`;
    const allLocs = [
      bookUrl,
      ...LOCALES.map((lang) => `${BASE_URL}/${lang}/books/${slug}`),
    ];

    for (const loc of allLocs) {
      bookXml += `  <url>\n`;
      bookXml += `    <loc>${loc}</loc>\n`;
      bookXml += `    <lastmod>${today}</lastmod>\n`;
      bookXml += `    <changefreq>weekly</changefreq>\n`;
      bookXml += `    <priority>0.8</priority>\n`;
      for (const lang of LOCALES) {
        bookXml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}/books/${slug}"/>\n`;
      }
      bookXml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${bookUrl}"/>\n`;
      bookXml += `  </url>\n`;
    }
  }

  bookXml += `</urlset>\n`;
  fs.writeFileSync(path.resolve('public', `sitemap_${c}.xml`), bookXml, 'utf8');

  indexXml += `  <sitemap>\n`;
  indexXml += `    <loc>${BASE_URL}/sitemap_${c}.xml</loc>\n`;
  indexXml += `    <lastmod>${today}</lastmod>\n`;
  indexXml += `  </sitemap>\n`;
}

indexXml += `</sitemapindex>\n`;
fs.writeFileSync(path.resolve('public', 'sitemap.xml'), indexXml, 'utf8');

console.log(`Generated sitemap.xml index, sitemap_static.xml, and ${chunkCount} book sitemap chunk(s) (${validBooks.length} books).`);