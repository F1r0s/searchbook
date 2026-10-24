// Cloudflare Pages Function: /sitemap_static.xml
// Generates XML sitemap for static core pages with multilingual alternates

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];

  const languages = ['en', 'es', 'fr', 'pt'];
  const sections = [
    { sub: '', priority: '1.0', changefreq: 'daily' },
    { sub: 'library', priority: '0.9', changefreq: 'daily' },
    { sub: 'features', priority: '0.8', changefreq: 'weekly' },
    { sub: 'vocab', priority: '0.7', changefreq: 'weekly' },
    { sub: 'stats', priority: '0.7', changefreq: 'weekly' },
    { sub: 'about', priority: '0.7', changefreq: 'monthly' },
    { sub: 'contact', priority: '0.6', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Root canonical entry
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  for (const altLang of languages) {
    xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altLang}"/>\n`;
  }
  xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}"/>\n`;
  xml += `  </url>\n`;

  for (const s of sections) {
    for (const lang of languages) {
      const locPath = s.sub ? `${lang}/${s.sub}` : lang;
      const locUrl = `${baseUrl}/${locPath}`;

      xml += `  <url>\n`;
      xml += `    <loc>${locUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${s.changefreq}</changefreq>\n`;
      xml += `    <priority>${s.priority}</priority>\n`;

      for (const altLang of languages) {
        const altPath = s.sub ? `${altLang}/${s.sub}` : altLang;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altPath}"/>\n`;
      }
      const defaultPath = s.sub ? `en/${s.sub}` : 'en';
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/${defaultPath}"/>\n`;
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