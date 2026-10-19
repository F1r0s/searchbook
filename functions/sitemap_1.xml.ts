// Cloudflare Pages Function: /sitemap_1.xml
// Partition 1 of book catalog URLs with multilingual hreflang attributes

import books from '../public/books.json';

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];
  const items = Array.isArray(books) ? books.slice(0, 5000) : [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const b of items) {
    const slug = b.slug || b.id;
    if (!slug) continue;

    const bookUrl = `${baseUrl}/books/${slug}`;
    const enUrl = `${baseUrl}/en/books/${slug}`;
    const esUrl = `${baseUrl}/es/books/${slug}`;
    const frUrl = `${baseUrl}/fr/books/${slug}`;
    const ptUrl = `${baseUrl}/pt/books/${slug}`;

    xml += `  <url>\n`;
    xml += `    <loc>${bookUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pt" href="${ptUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${bookUrl}"/>\n`;
    xml += `  </url>\n`;
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