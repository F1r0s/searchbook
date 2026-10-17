-- BookSearch (Bookplate) Database Schema for PostgreSQL
-- Designed for lightweight scraped metadata (no cloud asset hosting) and bilingual pSEO

CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255),
  author VARCHAR(255) NOT NULL,
  author_slug VARCHAR(255) NOT NULL,
  isbn VARCHAR(32),
  year INTEGER,
  genre VARCHAR(128) NOT NULL DEFAULT 'Literature',
  genre_fr VARCHAR(128),
  pages INTEGER NOT NULL DEFAULT 0,
  current_page INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
  status VARCHAR(32) NOT NULL DEFAULT 'want_to_read', -- finished, reading, want_to_read, dnf
  started_date DATE,
  finished_date DATE,
  cover_image TEXT, -- External hotlinked URL (Open Library, Google Books, CDN)
  cover_color VARCHAR(32),
  color_index INTEGER NOT NULL DEFAULT 0,
  synopsis TEXT,
  synopsis_fr TEXT,
  review TEXT,
  notes TEXT,
  notes_fr TEXT,
  read_online_url TEXT,
  preview_url TEXT,
  download_url TEXT,
  is_public_domain BOOLEAN NOT NULL DEFAULT false,
  source_provider VARCHAR(64),
  source_format VARCHAR(64) DEFAULT 'bookstore',
  is_curated BOOLEAN NOT NULL DEFAULT false, -- True if featured in user's shelf
  is_pseo_published BOOLEAN NOT NULL DEFAULT true, -- True to expose in public pSEO & sitemap
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_author_slug ON books(author_slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_pseo ON books(is_pseo_published);

CREATE TABLE IF NOT EXISTS vocabulary (
  id VARCHAR(64) PRIMARY KEY,
  word VARCHAR(128) NOT NULL,
  phonetic VARCHAR(128),
  part_of_speech VARCHAR(64) NOT NULL DEFAULT 'noun',
  definition_en TEXT NOT NULL,
  definition_fr TEXT,
  sample_sentence TEXT,
  book_title VARCHAR(255),
  book_slug VARCHAR(255),
  mastered BOOLEAN NOT NULL DEFAULT false,
  language VARCHAR(8) NOT NULL DEFAULT 'en', -- en or fr
  date_added DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vocab_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocab_mastered ON vocabulary(mastered);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pseo_templates (
  id VARCHAR(64) PRIMARY KEY,
  template_key VARCHAR(64) NOT NULL UNIQUE, -- e.g. book_en, book_fr, author_en, author_fr
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_heading TEXT NOT NULL,
  schema_type VARCHAR(64) NOT NULL DEFAULT 'Book',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default bilingual pSEO templates
INSERT INTO pseo_templates (id, template_key, meta_title, meta_description, h1_heading, schema_type)
VALUES
  ('tmpl-book-en', 'book_en', '{title} by {author} – Summary, Reading Time & Notes | Bookplate', 'Discover {title} by {author}. Read key themes, synopsis, {pages} pages summary, quotes, and reading tracker data.', '{title}', 'Book'),
  ('tmpl-book-fr', 'book_fr', '{title} par {author} – Résumé, Temps de lecture et Fiche | Bookplate', 'Découvrez {title} de {author}. Résumé complet, analyse de {pages} pages, citations et journal de lecture.', '{title}', 'Book'),
  ('tmpl-author-en', 'author_en', 'All Books by {author} – Bibliography & Reading Order | Bookplate', 'Complete list of books written by {author} with publication dates, ratings, and reader reviews.', 'Books by {author}', 'ProfilePage'),
  ('tmpl-author-fr', 'author_fr', 'Tous les livres de {author} – Bibliographie et Ordre de lecture | Bookplate', 'Liste complète des oeuvres publiées par {author} avec notes de lecture et dates de parution.', 'Livres de {author}', 'ProfilePage')
ON CONFLICT (template_key) DO NOTHING;