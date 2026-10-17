import fs from 'fs';
import path from 'path';

// Curated list of 115 world-renowned modern and classic titles across 6 major genres
const CURATED_TITLES = [
  // Psychology, Self-Help & Personal Growth
  { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help / Psychology' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', genre: 'Psychology' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', genre: 'Finance / Psychology' },
  { title: 'Deep Work', author: 'Cal Newport', genre: 'Self-Help / Productivity' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', genre: 'Psychology' },
  { title: 'Man’s Search for Meaning', author: 'Viktor E. Frankl', genre: 'Psychology / Philosophy' },
  { title: 'Quiet: The Power of Introverts', author: 'Susan Cain', genre: 'Psychology' },
  { title: 'Outliers: The Story of Success', author: 'Malcolm Gladwell', genre: 'Social Science' },
  { title: 'Can’t Hurt Me', author: 'David Goggins', genre: 'Memoir / Self-Help' },
  { title: 'Essentialism: The Disciplined Pursuit of Less', author: 'Greg McKeown', genre: 'Productivity' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', genre: 'Self-Help' },
  { title: 'Mindset: The New Psychology of Success', author: 'Carol S. Dweck', genre: 'Psychology' },
  { title: 'Flow: The Psychology of Optimal Experience', author: 'Mihaly Csikszentmihalyi', genre: 'Psychology' },
  { title: 'Grit: The Power of Passion and Perseverance', author: 'Angela Duckworth', genre: 'Psychology' },
  { title: 'Digital Minimalism', author: 'Cal Newport', genre: 'Productivity' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', genre: 'Self-Help' },
  { title: 'Influence: The Psychology of Persuasion', author: 'Robert B. Cialdini', genre: 'Psychology' },
  { title: 'Thinking in Bets', author: 'Annie Duke', genre: 'Decision Making' },
  { title: 'Make Time', author: 'Jake Knapp', genre: 'Productivity' },
  { title: 'Drive: The Surprising Truth About What Motivates Us', author: 'Daniel H. Pink', genre: 'Psychology' },

  // Science Fiction & Dystopian
  { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopian Fiction' },
  { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Dystopian Fiction' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Dystopian Fiction' },
  { title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Science Fiction' },
  { title: 'The Martian', author: 'Andy Weir', genre: 'Science Fiction' },
  { title: 'The Three-Body Problem', author: 'Cixin Liu', genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', genre: 'Cyberpunk' },
  { title: 'Foundation', author: 'Isaac Asimov', genre: 'Science Fiction' },
  { title: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', genre: 'Science Fiction' },
  { title: 'Hyperion', author: 'Dan Simmons', genre: 'Science Fiction' },
  { title: 'Snow Crash', author: 'Neal Stephenson', genre: 'Cyberpunk' },
  { title: 'Dark Matter', author: 'Blake Crouch', genre: 'Sci-Fi Thriller' },
  { title: 'Recursion', author: 'Blake Crouch', genre: 'Sci-Fi Thriller' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: 'Science Fiction' },
  { title: 'Solaris', author: 'Stanislaw Lem', genre: 'Science Fiction' },
  { title: 'The Hitchhiker’s Guide to the Galaxy', author: 'Douglas Adams', genre: 'Sci-Fi Comedy' },
  { title: 'Children of Time', author: 'Adrian Tchaikovsky', genre: 'Science Fiction' },
  { title: 'Contact', author: 'Carl Sagan', genre: 'Science Fiction' },
  { title: 'Ender’s Game', author: 'Orson Scott Card', genre: 'Science Fiction' },

  // Contemporary & Literary Fiction
  { title: 'The Midnight Library', author: 'Matt Haig', genre: 'Literary Fiction' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', genre: 'Literary Mystery' },
  { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction' },
  { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', genre: 'Literary Fiction' },
  { title: 'Lessons in Chemistry', author: 'Bonnie Garmus', genre: 'Historical Fiction' },
  { title: 'The Song of Achilles', author: 'Madeline Miller', genre: 'Mythological Fiction' },
  { title: 'Circe', author: 'Madeline Miller', genre: 'Mythological Fiction' },
  { title: 'Normal People', author: 'Sally Rooney', genre: 'Literary Fiction' },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Literary Fiction' },
  { title: 'Never Let Me Go', author: 'Kazuo Ishiguro', genre: 'Dystopian Fiction' },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Philosophical Fiction' },
  { title: 'There Are Rivers in the Sky', author: 'Elif Shafak', genre: 'Literary Fiction' },
  { title: 'The Book Thief', author: 'Markus Zusak', genre: 'Historical Fiction' },
  { title: 'All the Light We Cannot See', author: 'Anthony Doerr', genre: 'Historical Fiction' },
  { title: 'A Gentleman in Moscow', author: 'Amor Towles', genre: 'Historical Fiction' },
  { title: 'Yellowface', author: 'R.F. Kuang', genre: 'Satire / Literary' },
  { title: 'Demon Copperhead', author: 'Barbara Kingsolver', genre: 'Literary Fiction' },
  { title: 'Sea of Tranquility', author: 'Emily St. John Mandel', genre: 'Literary Fiction' },
  { title: 'Station Eleven', author: 'Emily St. John Mandel', genre: 'Post-Apocalyptic' },
  { title: 'The Overstory', author: 'Richard Powers', genre: 'Literary Fiction' },

  // Philosophy & Timeless Classics
  { title: 'Meditations', author: 'Marcus Aurelius', genre: 'Stoic Philosophy' },
  { title: 'The Stranger', author: 'Albert Camus', genre: 'Existentialism' },
  { title: 'The Myth of Sisyphus', author: 'Albert Camus', genre: 'Philosophy' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'Beyond Good and Evil', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'The Republic', author: 'Plato', genre: 'Philosophy' },
  { title: 'Letters from a Stoic', author: 'Seneca', genre: 'Stoic Philosophy' },
  { title: 'The Prince', author: 'Niccolò Machiavelli', genre: 'Political Philosophy' },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', genre: 'Gothic Classic' },
  { title: 'The Metamorphosis', author: 'Franz Kafka', genre: 'Modernist Fiction' },
  { title: 'The Trial', author: 'Franz Kafka', genre: 'Classic Fiction' },
  { title: 'Notes from Underground', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', genre: 'Classic Literature' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic Literature' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic Literature' },
  { title: 'Catch-22', author: 'Joseph Heller', genre: 'Classic Satire' },
  { title: 'The Art of War', author: 'Sun Tzu', genre: 'Military Strategy' },
  { title: 'Walden', author: 'Henry David Thoreau', genre: 'Philosophy / Nature' },

  // History, Science & Non-Fiction
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', genre: 'History / Anthropology' },
  { title: 'Homo Deus: A Brief History of Tomorrow', author: 'Yuval Noah Harari', genre: 'Futurism / Philosophy' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', genre: 'History / Anthropology' },
  { title: 'Educated', author: 'Tara Westover', genre: 'Memoir' },
  { title: 'Born a Crime', author: 'Trevor Noah', genre: 'Memoir / Biography' },
  { title: 'Killers of the Flower Moon', author: 'David Grann', genre: 'History / True Crime' },
  { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', genre: 'Popular Science' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', genre: 'Science / History' },
  { title: 'Bad Blood: Secrets and Lies in a Silicon Valley Startup', author: 'John Carreyrou', genre: 'Investigative Journalism' },
  { title: 'Shoe Dog', author: 'Phil Knight', genre: 'Business Memoir' },
  { title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'Elon Musk', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'The Wright Brothers', author: 'David McCullough', genre: 'History / Biography' },
  { title: 'Cosmos', author: 'Carl Sagan', genre: 'Popular Science' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Cosmology / Physics' },
  { title: 'The Gene: An Intimate History', author: 'Siddhartha Mukherjee', genre: 'Science / Medicine' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee', genre: 'Science / Medicine' },
  { title: 'The Body: A Guide for Occupants', author: 'Bill Bryson', genre: 'Science / Anatomy' },
  { title: 'Endurance: Shackleton’s Incredible Voyage', author: 'Alfred Lansing', genre: 'History / Adventure' },
  { title: 'Atomic Adventures', author: 'James Mahaffey', genre: 'Science / History' },

  // Mystery, Thriller & Suspense
  { title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Psychological Thriller' },
  { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Psychological Thriller' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', genre: 'Crime Thriller' },
  { title: 'And Then There Were None', author: 'Agatha Christie', genre: 'Classic Mystery' },
  { title: 'The Da Vinci Code', author: 'Dan Brown', genre: 'Conspiracy Thriller' },
  { title: 'Sharp Objects', author: 'Gillian Flynn', genre: 'Psychological Thriller' },
  { title: 'Big Little Lies', author: 'Liane Moriarty', genre: 'Mystery / Drama' },
  { title: 'Verity', author: 'Colleen Hoover', genre: 'Psychological Thriller' },
  { title: 'The Thursday Murder Club', author: 'Richard Osman', genre: 'Cozy Mystery' },
  { title: 'The Maid', author: 'Nita Prose', genre: 'Mystery' },
  { title: 'The Guest List', author: 'Lucy Foley', genre: 'Mystery Thriller' },
  { title: 'In Cold Blood', author: 'Truman Capote', genre: 'True Crime Classic' },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', genre: 'Detective Fiction' },
  { title: 'Shutter Island', author: 'Dennis Lehane', genre: 'Psychological Thriller' },
  { title: 'The Girl on the Train', author: 'Paula Hawkins', genre: 'Psychological Thriller' },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function scrapeBookMetadata(item) {
  const query = `${item.title} ${item.author}`;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const doc = data.docs && data.docs.length > 0 ? data.docs[0] : null;

    const title = doc?.title || item.title;
    const author = doc?.author_name ? doc.author_name[0] : item.author;
    const year = doc?.first_publish_year || 2020;
    const pages = doc?.number_of_pages_median || (doc?.number_of_pages ? doc.number_of_pages[0] : 320);
    const coverId = doc?.cover_i;
    const coverImage = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : undefined;

    const slug = slugify(title);
    const authorSlug = slugify(author);
    const ia = doc?.ia && doc.ia.length > 0 ? doc.ia[0] : undefined;

    let readOnlineUrl = undefined;
    let previewUrl = doc?.key ? `https://openlibrary.org${doc.key}` : undefined;
    let downloadUrl = undefined;
    let downloadPdfUrl = undefined;
    let downloadEpubUrl = undefined;
    let isPublicDomain = false;
    let openSourceProvider = undefined;

    if (ia) {
      if (doc.public_scan_b) {
        isPublicDomain = true;
        readOnlineUrl = `https://archive.org/stream/${ia}`;
        downloadUrl = `https://archive.org/download/${ia}/${ia}.epub`;
        downloadPdfUrl = `https://archive.org/download/${ia}/${ia}.pdf`;
        downloadEpubUrl = `https://archive.org/download/${ia}/${ia}.epub`;
        openSourceProvider = 'Internet Archive (Open Source / Public Scan)';
      } else {
        previewUrl = `https://archive.org/details/${ia}`;
        openSourceProvider = 'Internet Archive (Lending / Preview)';
      }
    }

    // Hash for binding cloth color
    const colorIndex = Math.abs(slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 12;

    const synopsis =
      doc?.first_sentence && typeof doc.first_sentence[0] === 'string'
        ? doc.first_sentence[0]
        : `A celebrated work of ${item.genre} by ${author}. Published in ${year}.`;

    const rating = Math.min(5, Math.max(4, 4 + ((colorIndex % 3) * 0.5)));

    return {
      id: slug,
      slug,
      title,
      author,
      authorSlug,
      year: Number(year) || 2020,
      genre: item.genre,
      pages: Number(pages) || 300,
      rating,
      status: 'want_to_read',
      coverImage,
      colorIndex,
      synopsis,
      readOnlineUrl,
      previewUrl,
      downloadUrl,
      downloadPdfUrl,
      downloadEpubUrl,
      isPublicDomain,
      openSourceProvider,
    };
  } catch (err) {
    console.warn(`[Scraper] Fallback for "${item.title}":`, err.message);
    const slug = slugify(item.title);
    return {
      id: slug,
      slug,
      title: item.title,
      author: item.author,
      authorSlug: slugify(item.author),
      year: 2020,
      genre: item.genre,
      pages: 320,
      rating: 4.5,
      status: 'want_to_read',
      colorIndex: 0,
      synopsis: `A celebrated work of ${item.genre} by ${item.author}.`,
    };
  }
}

async function run() {
  console.log(`Starting bulk scrape of ${CURATED_TITLES.length} books for public catalog...`);
  const catalog = [];
  const batchSize = 5;

  for (let i = 0; i < CURATED_TITLES.length; i += batchSize) {
    const chunk = CURATED_TITLES.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map((item) => scrapeBookMetadata(item)));
    catalog.push(...results);
    const progress = Math.min(catalog.length, CURATED_TITLES.length);
    console.log(`Progress: ${progress}/${CURATED_TITLES.length} books scraped...`);

    // Polite delay
    await new Promise((r) => setTimeout(r, 200));
  }

  const outDir = path.resolve('src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'public-books.json');
  fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), 'utf8');

  // Also write to public/books.json for fast external static fetch
  const publicOut = path.resolve('public', 'books.json');
  fs.writeFileSync(publicOut, JSON.stringify(catalog, null, 2), 'utf8');

  console.log(`\n🎉 Successfully generated public catalog with ${catalog.length} books!`);
  console.log(`Saved to: ${outFile}`);
  console.log(`Saved to: ${publicOut}`);
}

run();
