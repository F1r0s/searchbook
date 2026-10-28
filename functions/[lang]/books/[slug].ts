// Cloudflare Pages Function: /:lang/books/:slug
// Multilingual Edge Pre-Rendering for localized Google search queries (EN, ES, FR, PT)

import books from '../../../public/books.json';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const LOCALIZED_COPY: Record<string, { readOnline: string; downloadPdf: string; downloadEpub: string; browseAll: string; freeNotice: string }> = {
  es: {
    readOnline: '📖 Leer en Línea Gratis ↗',
    downloadPdf: '⬇ Descargar PDF',
    downloadEpub: '⬇ Descargar EPUB',
    browseAll: 'Explorar todo el catálogo →',
    freeNotice: 'Sin registro · Guardado localmente en tu dispositivo',
  },
  fr: {
    readOnline: '📖 Lire en Ligne Gratuitement ↗',
    downloadPdf: '⬇ Télécharger PDF',
    downloadEpub: '⬇ Télécharger EPUB',
    browseAll: 'Parcourir tout le catalogue →',
    freeNotice: 'Aucun compte requis · Sauvegardé localement sur votre appareil',
  },
  pt: {
    readOnline: '📖 Ler Online Gratuitamente ↗',
    downloadPdf: '⬇ Descarregar PDF',
    downloadEpub: '⬇ Descarregar EPUB',
    browseAll: 'Explorar todo o catálogo →',
    freeNotice: 'Sem registo · Guardado localmente no teu dispositivo',
  },
  en: {
    readOnline: '📖 Read Full Book Online ↗',
    downloadPdf: '⬇ Download PDF',
    downloadEpub: '⬇ Download EPUB',
    browseAll: 'Browse 50+ Volumes in Library →',
    freeNotice: 'Zero accounts required · Auto-saved to browser storage',
  },
};

export async function onRequest(context: any): Promise<Response> {
  const { params } = context;
  const lang = String(params.lang || 'en').toLowerCase();
  const slug = String(params.slug || '').trim();

  if (!slug) {
    return context.next();
  }

  const bookList = Array.isArray(books) ? books : [];
  const book = bookList.find(
    (b: any) => (b.slug && b.slug === slug) || (b.id && b.id === slug)
  );

  if (!book) {
    return context.next();
  }

  const copy = LOCALIZED_COPY[lang] || LOCALIZED_COPY.en;
  const baseUrl = 'https://readbook.pages.dev';
  const cleanTitle = escapeHtml(book.title || 'Untitled');
  const cleanAuthor = escapeHtml(book.author || 'Unknown');
  const cleanGenre = escapeHtml(book.genre || 'Literature');
  const pagesText = book.pages ? `${book.pages} pages` : 'Complete Edition';
  const cleanSynopsis = escapeHtml(
    book.synopsis || `Discover ${cleanTitle} by ${cleanAuthor}. Free digital reading, PDF, and EPUB e-reader downloads.`
  );

  const canonicalUrl = `${baseUrl}/${lang}/books/${book.slug || slug}`;
  const coverUrl = book.coverImage || `${baseUrl}/covers/default.jpg`;

  const schemaJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    inLanguage: lang,
    numberOfPages: book.pages || undefined,
    genre: book.genre || 'Literature',
    datePublished: book.year ? `${book.year}-01-01` : undefined,
    image: book.coverImage || undefined,
    description: book.synopsis || `${cleanTitle} by ${cleanAuthor}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  });

  const rawHtml = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <meta name="google-site-verification" content="kn1X81LTJ2nP26oY4sAdDK1gsBqVCCz6antlf4HANzY" />
    <title>${cleanTitle} by ${cleanAuthor} – Readbook</title>
    <meta name="description" content="${cleanSynopsis.slice(0, 160)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="x-default" href="${baseUrl}/books/${book.slug || slug}" />
    <link rel="alternate" hreflang="en" href="${baseUrl}/en/books/${book.slug || slug}" />
    <link rel="alternate" hreflang="es" href="${baseUrl}/es/books/${book.slug || slug}" />
    <link rel="alternate" hreflang="fr" href="${baseUrl}/fr/books/${book.slug || slug}" />
    <link rel="alternate" hreflang="pt" href="${baseUrl}/pt/books/${book.slug || slug}" />
    <meta property="og:site_name" content="Readbook" />
    <meta property="og:title" content="${cleanTitle} by ${cleanAuthor} – Readbook" />
    <meta property="og:description" content="${cleanSynopsis.slice(0, 160)}" />
    <meta property="og:image" content="${coverUrl}" />
    <meta property="og:type" content="book" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <script type="application/ld+json">
    ${schemaJsonLd}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body style="background:#f4f2ec;color:#111111;margin:0;font-family:'Inter',system-ui,sans-serif;">
    <div id="root">
      <div style="max-width:880px;margin:32px auto;padding:24px;background:#ffffff;border:3px solid #111111;box-shadow:6px 6px 0 #111111;">
        <nav style="font-size:12px;margin-bottom:18px;color:#6b6862;">
          <a href="/${lang}" style="color:inherit;text-decoration:none;">Readbook</a> ›
          <a href="/${lang}/library" style="color:inherit;text-decoration:none;">Library</a> › 
          <span style="color:#111111;font-weight:700;">${cleanTitle}</span>
        </nav>
        
        <header style="border-bottom:2px solid #111111;padding-bottom:18px;margin-bottom:20px;">
          <span style="background:#ff3b1f;color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border:1px solid #111;text-transform:uppercase;letter-spacing:0.08em;">
            ${cleanGenre}
          </span>
          <h1 style="font-family:'Fraunces',Georgia,serif;font-size:38px;line-height:1.1;margin:10px 0 6px;">
            ${cleanTitle}
          </h1>
          <p style="font-size:16px;color:#6b6862;margin:0;font-weight:600;">
            by <strong>${cleanAuthor}</strong> · ${pagesText} · ${book.year || 'Public Edition'}
          </p>
        </header>

        <section style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;">
          ${book.downloadPdfUrl ? `<a href="${book.downloadPdfUrl}" target="_blank" rel="noopener noreferrer" style="background:#111;color:#fff;padding:10px 18px;text-decoration:none;font-weight:800;font-size:13px;border:2px solid #111;display:inline-block;">${copy.downloadPdf} (${book.fileSize || '2.4 MB'})</a>` : ''}
          ${book.downloadEpubUrl ? `<a href="${book.downloadEpubUrl}" target="_blank" rel="noopener noreferrer" style="background:#1a34d6;color:#fff;padding:10px 18px;text-decoration:none;font-weight:800;font-size:13px;border:2px solid #111;display:inline-block;">${copy.downloadEpub}</a>` : ''}
          ${book.readOnlineUrl ? `<a href="${book.readOnlineUrl}" target="_blank" rel="noopener noreferrer" style="background:#fff;color:#111;padding:10px 18px;text-decoration:none;font-weight:700;font-size:13px;border:2px solid #111;display:inline-block;">${copy.readOnline}</a>` : ''}
        </section>

        <section style="margin-bottom:24px;">
          <p style="font-size:15px;line-height:1.75;color:#111;">${cleanSynopsis}</p>
        </section>

        <footer style="border-top:2px solid #111;padding-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <span style="font-size:12px;color:#6b6862;">${copy.freeNotice}</span>
          <a href="/${lang}/library" style="font-size:12px;font-weight:800;color:#ff3b1f;text-decoration:none;">${copy.browseAll}</a>
        </footer>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  return new Response(rawHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
