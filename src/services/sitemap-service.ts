import { Book } from '../types';

export const SITEMAP_CHUNK_SIZE = 1000; // 1,000 books per sitemap_N.xml chunk (5,000 localized URLs per chunk)

export class SitemapService {
  /**
   * Generates the root sitemap.xml index pointing to sitemap_static.xml and sitemap_1.xml .. sitemap_N.xml
   */
  public static generateSitemapIndex(totalBooks: number, baseUrl = 'https://libpdf.pages.dev'): string {
    const today = new Date().toISOString().split('T')[0];
    const chunksCount = Math.max(1, Math.ceil(totalBooks / SITEMAP_CHUNK_SIZE));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap_static.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;

    for (let i = 1; i <= chunksCount; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/sitemap_${i}.xml</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>\n`;
    return xml;
  }

  /**
   * Generates a partitioned child sitemap (e.g. sitemap_1.xml, sitemap_2.xml)
   */
  public static generateBookChunkSitemap(
    books: Book[],
    chunkIndex: number,
    baseUrl = 'https://libpdf.pages.dev'
  ): string {
    const today = new Date().toISOString().split('T')[0];
    const validBooks = books.filter((b) => Boolean(b && (b.slug || b.id)));
    const startIndex = (chunkIndex - 1) * SITEMAP_CHUNK_SIZE;
    const chunkBooks = validBooks.slice(startIndex, startIndex + SITEMAP_CHUNK_SIZE);
    const locales = ['en', 'es', 'fr', 'pt'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const book of chunkBooks) {
      const slug = String(book.slug || book.id).trim();
      if (!slug) continue;

      const bookUrl = `${baseUrl}/books/${slug}`;
      const allLocs = [bookUrl, ...locales.map((l) => `${baseUrl}/${l}/books/${slug}`)];

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

    xml += `</urlset>\n`;
    return xml;
  }

  /**
   * Generates static pages sitemap across all 4 supported locales
   */
  public static generateStaticSitemap(baseUrl = 'https://libpdf.pages.dev'): string {
    const today = new Date().toISOString().split('T')[0];
    const locales = ['en', 'es', 'fr', 'pt'];
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

    for (const s of sections) {
      for (const lang of locales) {
        const locPath = s.sub ? `${lang}/${s.sub}` : lang;
        const locUrl = `${baseUrl}/${locPath}`;

        xml += `  <url>\n`;
        xml += `    <loc>${locUrl}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${s.changefreq}</changefreq>\n`;
        xml += `    <priority>${s.priority}</priority>\n`;
        for (const altLang of locales) {
          const altPath = s.sub ? `${altLang}/${s.sub}` : altLang;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altPath}"/>\n`;
        }
        const defaultPath = s.sub ? `en/${s.sub}` : 'en';
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/${defaultPath}"/>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>\n`;
    return xml;
  }

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