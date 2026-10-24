// Cloudflare Pages Function: /sitemap_1.xml
// Partition 1 of book catalog URLs with multilingual hreflang attributes

import books from '../public/books.json';

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];
  const validBooks = Array.isArray(books) ? books.filter((b: any) => Boolean(b.slug || b.id)) : [];
  const items = validBooks.slice(0, 1000);
  const locales = ['en', 'es', 'fr', 'pt'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const b of items) {
    const slug = String(b.slug || b.id || '').trim();
    if (!slug) continue;

    const bookUrl = `${baseUrl}/books/${slug}`;
    const enUrl = `${baseUrl}/en/books/${slug}`;
    const esUrl = `${baseUrl}/es/books/${slug}`;
    const frUrl = `${baseUrl}/fr/books/${slug}`;
    const ptUrl = `${baseUrl}/pt/books/${slug}`;
    const allLocs = [bookUrl, enUrl, esUrl, frUrl, ptUrl];

    for (const loc of allLocs) {
      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      for (const lang of locales) {
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}/books/${slug}"/>\n`;
      }
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${bookUrl}"/>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}