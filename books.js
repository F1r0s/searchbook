/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/books.json
  Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400
  Access-Control-Allow-Origin: *

/sitemap*.xml
  Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400
  Content-Type: application/xml; charset=utf-8