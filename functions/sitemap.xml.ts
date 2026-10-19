// Cloudflare Pages Function: /sitemap.xml
// Generates the root sitemap index pointing to partitioned child sitemaps

import books from '../public/books.json';

const SITEMAP_CHUNK_SIZE = 5000;

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];
  const totalBooks = Array.isArray(books) ? books.length : 50;
  const chunkCount = Math.max(1, Math.ceil(totalBooks / SITEMAP_CHUNK_SIZE));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static core routes
  xml += `  <sitemap>\n`;
  xml += `    <loc>${baseUrl}/sitemap_static.xml</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `  </sitemap>\n`;

  // Partitioned child sitemaps for search crawlers
  for (let i = 1; i <= chunkCount; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap_${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}