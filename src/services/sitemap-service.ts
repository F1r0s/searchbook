import { BookRecord } from '../lib/db';

export const SITEMAP_CHUNK_SIZE = 5000; // 5,000 URLs per sub-sitemap

export class SitemapService {
  /**
   * Generates the root sitemap index pointing to sub-sitemaps
   * e.g. /sitemap.xml -> sitemap_static.xml, sitemap_1.xml, sitemap_2.xml
   */
  public static generateSitemapIndex(totalBooks: number, baseUrl = 'https://searchbook.pages.dev'): string {
    const today = new Date().toISOString().split('T')[0];
    const chunksCount = Math.max(1, Math.ceil(totalBooks / SITEMAP_CHUNK_SIZE));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static & Core pages sitemap
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap_static.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;

    // Chunked book sitemaps (sitemap_1.xml, sitemap_2.xml, etc.)
    for (let i = 1; i <= chunksCount; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/sitemap_${i}.xml</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;
    return xml;
  }

  /**
   * Generates a chunked child sitemap containing up to 5,000 books with bilingual hreflang
   */
  public static generateBookChunkSitemap(
    books: BookRecord[],
    chunkIndex: number,
    baseUrl = 'https://searchbook.pages.dev'
  ): string {
    const startIndex = (chunkIndex - 1) * SITEMAP_CHUNK_SIZE;
    const chunkBooks = books.slice(startIndex, startIndex + SITEMAP_CHUNK_SIZE);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const book of chunkBooks) {
      const lastmod = (book.updatedAt || new Date().toISOString()).split('T')[0];
      const bookUrl = `${baseUrl}/books/${book.slug}`;
      const enUrl = `${baseUrl}/en/books/${book.slug}`;
      const esUrl = `${baseUrl}/es/books/${book.slug}`;
      const frUrl = `${baseUrl}/fr/books/${book.slug}`;
      const ptUrl = `${baseUrl}/pt/books/${book.slug}`;

      xml += `  <url>\n`;
      xml += `    <loc>${bookUrl}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
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
    return xml;
  }

  /**
   * Generates static pages sitemap
   */
  public static generateStaticSitemap(baseUrl = 'https://searchbook.pages.dev'): string {
    const today = new Date().toISOString().split('T')[0];
    const routes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/library', priority: '0.9', changefreq: 'daily' },
      { path: '/vocab', priority: '0.7', changefreq: 'weekly' },
      { path: '/stats', priority: '0.7', changefreq: 'weekly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const r of routes) {
      const enUrl = `${baseUrl}/en${r.path}`;
      const frUrl = `${baseUrl}/fr${r.path}`;

      xml += `  <url>\n`;
      xml += `    <loc>${enUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>\n`;
      xml += `  </url>\n`;

      xml += `  <url>\n`;
      xml += `    <loc>${frUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Browser file download helper
   */
  public static downloadXml(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}