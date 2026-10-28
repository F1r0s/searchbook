// Cloudflare Pages Function: /sitemap.xml
// Dynamic Sitemap Index listing /sitemap_static.xml and partitioned /sitemap_1.xml ... /sitemap_N.xml

import books from '../public/books.json';

const SITEMAP_CHUNK_SIZE = 1000;

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];
  const allBooks = Array.isArray(books) ? books.filter((b: any) => Boolean(b && (b.slug || b.id))) : [];
  const chunkCount = Math.max(1, Math.ceil(allBooks.length / SITEMAP_CHUNK_SIZE));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <sitemap>\n`;
  xml += `    <loc>${baseUrl}/sitemap_static.xml</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `  </sitemap>\n`;

  for (let i = 1; i <= chunkCount; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap_${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}