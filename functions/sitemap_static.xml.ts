// Cloudflare Pages Function: /sitemap_static.xml
// Generates XML sitemap for static core pages with multilingual alternates

export async function onRequest(): Promise<Response> {
  const baseUrl = 'https://searchbook.pages.dev';
  const today = new Date().toISOString().split('T')[0];

  const routes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '#library', priority: '0.9', changefreq: 'daily' },
    { path: '#features', priority: '0.8', changefreq: 'weekly' },
    { path: '#vocab', priority: '0.7', changefreq: 'weekly' },
    { path: '#stats', priority: '0.7', changefreq: 'weekly' },
    { path: '#about', priority: '0.7', changefreq: 'monthly' },
    { path: '#contact', priority: '0.6', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const r of routes) {
    const locUrl = `${baseUrl}/${r.path}`;
    xml += `  <url>\n`;
    xml += `    <loc>${locUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
    xml += `    <priority>${r.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${locUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${locUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${locUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pt" href="${locUrl}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${locUrl}"/>\n`;
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