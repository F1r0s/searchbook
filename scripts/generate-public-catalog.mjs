import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Master Curated Pool of World-Renowned Titles across all genres
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
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', genre: 'Self-Help / Communication' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', genre: 'Self-Help / Finance' },
  { title: 'The 48 Laws of Power', author: 'Robert Greene', genre: 'Strategy / Psychology' },
  { title: 'Mastery', author: 'Robert Greene', genre: 'Personal Growth' },
  { title: 'The Laws of Human Nature', author: 'Robert Greene', genre: 'Psychology' },
  { title: 'The Daily Stoic', author: 'Ryan Holiday', genre: 'Stoic Philosophy' },
  { title: 'The Obstacle Is the Way', author: 'Ryan Holiday', genre: 'Stoic Philosophy' },
  { title: 'Ego Is the Enemy', author: 'Ryan Holiday', genre: 'Stoic Philosophy' },
  { title: 'Stillness Is the Key', author: 'Ryan Holiday', genre: 'Stoic Philosophy' },
  { title: 'Show Your Work!', author: 'Austin Kleon', genre: 'Creativity / Productivity' },
  { title: 'Steal Like an Artist', author: 'Austin Kleon', genre: 'Creativity' },
  { title: 'The War of Art', author: 'Steven Pressfield', genre: 'Creativity / Motivation' },
  { title: 'So Good They Can’t Ignore You', author: 'Cal Newport', genre: 'Productivity / Career' },
  { title: 'Slow Productivity', author: 'Cal Newport', genre: 'Productivity' },
  { title: 'Effortless: Make It Easier to Do What Matters Most', author: 'Greg McKeown', genre: 'Productivity' },
  { title: 'The Compound Effect', author: 'Darren Hardy', genre: 'Personal Growth' },
  { title: 'Tiny Habits', author: 'BJ Fogg', genre: 'Psychology / Habit Building' },
  { title: 'The Power of Now', author: 'Eckhart Tolle', genre: 'Spiritual / Mindfulness' },
  { title: 'A New Earth', author: 'Eckhart Tolle', genre: 'Spiritual / Mindfulness' },
  { title: 'The Four Agreements', author: 'Don Miguel Ruiz', genre: 'Philosophy / Personal Growth' },
  { title: 'Radical Acceptance', author: 'Tara Brach', genre: 'Mindfulness / Psychology' },
  { title: 'Wherever You Go, There You Are', author: 'Jon Kabat-Zinn', genre: 'Mindfulness' },
  { title: 'Predictably Irrational', author: 'Dan Ariely', genre: 'Behavioral Economics' },
  { title: 'Stumbling on Happiness', author: 'Daniel Gilbert', genre: 'Psychology' },
  { title: 'Emotional Intelligence', author: 'Daniel Goleman', genre: 'Psychology' },
  { title: 'Blink: The Power of Thinking Without Thinking', author: 'Malcolm Gladwell', genre: 'Cognitive Psychology' },
  { title: 'The Tipping Point', author: 'Malcolm Gladwell', genre: 'Social Science' },
  { title: 'David and Goliath', author: 'Malcolm Gladwell', genre: 'Social Science' },
  { title: 'Nudge: Improving Decisions About Health, Wealth, and Happiness', author: 'Richard H. Thaler', genre: 'Behavioral Economics' },
  { title: 'The Paradox of Choice', author: 'Barry Schwartz', genre: 'Psychology / Economics' },
  { title: 'Peak: Secrets from the New Science of Expertise', author: 'Anders Ericsson', genre: 'Psychology / Skill' },
  { title: 'Four Thousand Weeks: Time Management for Mortals', author: 'Oliver Burkeman', genre: 'Philosophy / Productivity' },
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', genre: 'Psychology / Mental Health' },
  { title: 'Maybe You Should Talk to Someone', author: 'Lori Gottlieb', genre: 'Psychology / Memoir' },
  { title: 'Dopamine Nation', author: 'Anna Lembke', genre: 'Psychology / Neuroscience' },

  // Science Fiction & Dystopian
  { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopian Fiction' },
  { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Dystopian Fiction' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Dystopian Fiction' },
  { title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Science Fiction' },
  { title: 'The Martian', author: 'Andy Weir', genre: 'Science Fiction' },
  { title: 'The Three-Body Problem', author: 'Cixin Liu', genre: 'Science Fiction' },
  { title: 'The Dark Forest', author: 'Cixin Liu', genre: 'Science Fiction' },
  { title: 'Death’s End', author: 'Cixin Liu', genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', genre: 'Cyberpunk' },
  { title: 'Count Zero', author: 'William Gibson', genre: 'Cyberpunk' },
  { title: 'Mona Lisa Overdrive', author: 'William Gibson', genre: 'Cyberpunk' },
  { title: 'Foundation', author: 'Isaac Asimov', genre: 'Science Fiction' },
  { title: 'Foundation and Empire', author: 'Isaac Asimov', genre: 'Science Fiction' },
  { title: 'Second Foundation', author: 'Isaac Asimov', genre: 'Science Fiction' },
  { title: 'I, Robot', author: 'Isaac Asimov', genre: 'Science Fiction' },
  { title: 'The Caves of Steel', author: 'Isaac Asimov', genre: 'Sci-Fi Mystery' },
  { title: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', genre: 'Science Fiction' },
  { title: 'Ubik', author: 'Philip K. Dick', genre: 'Science Fiction' },
  { title: 'A Scanner Darkly', author: 'Philip K. Dick', genre: 'Science Fiction' },
  { title: 'The Man in the High Castle', author: 'Philip K. Dick', genre: 'Alternative History' },
  { title: 'Hyperion', author: 'Dan Simmons', genre: 'Science Fiction' },
  { title: 'The Fall of Hyperion', author: 'Dan Simmons', genre: 'Science Fiction' },
  { title: 'Snow Crash', author: 'Neal Stephenson', genre: 'Cyberpunk' },
  { title: 'The Diamond Age', author: 'Neal Stephenson', genre: 'Sci-Fi / Cyberpunk' },
  { title: 'Dark Matter', author: 'Blake Crouch', genre: 'Sci-Fi Thriller' },
  { title: 'Recursion', author: 'Blake Crouch', genre: 'Sci-Fi Thriller' },
  { title: 'Upgrade', author: 'Blake Crouch', genre: 'Sci-Fi Thriller' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: 'Science Fiction' },
  { title: 'The Dispossessed', author: 'Ursula K. Le Guin', genre: 'Science Fiction' },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', genre: 'Fantasy' },
  { title: 'Solaris', author: 'Stanislaw Lem', genre: 'Science Fiction' },
  { title: 'The Cyberiad', author: 'Stanislaw Lem', genre: 'Sci-Fi / Satire' },
  { title: 'The Hitchhiker’s Guide to the Galaxy', author: 'Douglas Adams', genre: 'Sci-Fi Comedy' },
  { title: 'The Restaurant at the End of the Universe', author: 'Douglas Adams', genre: 'Sci-Fi Comedy' },
  { title: 'Children of Time', author: 'Adrian Tchaikovsky', genre: 'Science Fiction' },
  { title: 'Children of Ruin', author: 'Adrian Tchaikovsky', genre: 'Science Fiction' },
  { title: 'Contact', author: 'Carl Sagan', genre: 'Science Fiction' },
  { title: 'Ender’s Game', author: 'Orson Scott Card', genre: 'Science Fiction' },
  { title: 'Speaker for the Dead', author: 'Orson Scott Card', genre: 'Science Fiction' },
  { title: '2001: A Space Odyssey', author: 'Arthur C. Clarke', genre: 'Science Fiction' },
  { title: 'Rendezvous with Rama', author: 'Arthur C. Clarke', genre: 'Science Fiction' },
  { title: 'Childhood’s End', author: 'Arthur C. Clarke', genre: 'Science Fiction' },
  { title: 'The Time Machine', author: 'H.G. Wells', genre: 'Classic Sci-Fi' },
  { title: 'The War of the Worlds', author: 'H.G. Wells', genre: 'Classic Sci-Fi' },
  { title: 'The Invisible Man', author: 'H.G. Wells', genre: 'Classic Sci-Fi' },
  { title: 'The Island of Doctor Moreau', author: 'H.G. Wells', genre: 'Classic Sci-Fi' },
  { title: 'Journey to the Center of the Earth', author: 'Jules Verne', genre: 'Classic Adventure' },
  { title: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', genre: 'Classic Adventure' },
  { title: 'Around the World in Eighty Days', author: 'Jules Verne', genre: 'Classic Adventure' },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', genre: 'Satirical Sci-Fi' },
  { title: 'Cat’s Cradle', author: 'Kurt Vonnegut', genre: 'Satirical Sci-Fi' },
  { title: 'Stories of Your Life and Others', author: 'Ted Chiang', genre: 'Science Fiction' },
  { title: 'Exhalation', author: 'Ted Chiang', genre: 'Science Fiction' },
  { title: 'Blindsight', author: 'Peter Watts', genre: 'Hard Sci-Fi' },
  { title: 'A Canticle for Leibowitz', author: 'Walter M. Miller Jr.', genre: 'Post-Apocalyptic' },
  { title: 'The Road', author: 'Cormac McCarthy', genre: 'Post-Apocalyptic' },
  { title: 'Blood Meridian', author: 'Cormac McCarthy', genre: 'Western / Literary Fiction' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Epic Fantasy' },
  { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', genre: 'Epic Fantasy' },
  { title: 'The Two Towers', author: 'J.R.R. Tolkien', genre: 'Epic Fantasy' },
  { title: 'The Return of the King', author: 'J.R.R. Tolkien', genre: 'Epic Fantasy' },
  { title: 'The Silmarillion', author: 'J.R.R. Tolkien', genre: 'Mythopoeic Fantasy' },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Dark Fantasy' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy' },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', genre: 'Epic Fantasy' },
  { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', genre: 'Fantasy' },
  { title: 'Good Omens', author: 'Neil Gaiman', genre: 'Fantasy Comedy' },
  { title: 'American Gods', author: 'Neil Gaiman', genre: 'Modern Fantasy' },
  { title: 'Neverwhere', author: 'Neil Gaiman', genre: 'Urban Fantasy' },
  { title: 'Guards! Guards!', author: 'Terry Pratchett', genre: 'Fantasy Comedy' },
  { title: 'Mort', author: 'Terry Pratchett', genre: 'Fantasy Comedy' },
  { title: 'Small Gods', author: 'Terry Pratchett', genre: 'Fantasy Satire' },

  // Philosophy & Timeless Classics
  { title: 'Meditations', author: 'Marcus Aurelius', genre: 'Stoic Philosophy' },
  { title: 'The Stranger', author: 'Albert Camus', genre: 'Existentialism' },
  { title: 'The Myth of Sisyphus', author: 'Albert Camus', genre: 'Philosophy' },
  { title: 'The Rebel', author: 'Albert Camus', genre: 'Political Philosophy' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'The Idiot', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'Demons', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'Notes from Underground', author: 'Fyodor Dostoevsky', genre: 'Classic Literature' },
  { title: 'Beyond Good and Evil', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'The Gay Science', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'On the Genealogy of Morality', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'Twilight of the Idols', author: 'Friedrich Nietzsche', genre: 'Philosophy' },
  { title: 'The Republic', author: 'Plato', genre: 'Philosophy' },
  { title: 'Symposium', author: 'Plato', genre: 'Philosophy' },
  { title: 'Apology', author: 'Plato', genre: 'Philosophy' },
  { title: 'Nicomachean Ethics', author: 'Aristotle', genre: 'Ethics / Philosophy' },
  { title: 'Politics', author: 'Aristotle', genre: 'Political Philosophy' },
  { title: 'Letters from a Stoic', author: 'Seneca', genre: 'Stoic Philosophy' },
  { title: 'On the Shortness of Life', author: 'Seneca', genre: 'Stoic Philosophy' },
  { title: 'The Enchiridion', author: 'Epictetus', genre: 'Stoic Philosophy' },
  { title: 'Discourses of Epictetus', author: 'Epictetus', genre: 'Stoic Philosophy' },
  { title: 'The Prince', author: 'Niccolò Machiavelli', genre: 'Political Philosophy' },
  { title: 'Discourses on Livy', author: 'Niccolò Machiavelli', genre: 'Political Philosophy' },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', genre: 'Gothic Classic' },
  { title: 'The Metamorphosis', author: 'Franz Kafka', genre: 'Modernist Fiction' },
  { title: 'The Trial', author: 'Franz Kafka', genre: 'Classic Fiction' },
  { title: 'The Castle', author: 'Franz Kafka', genre: 'Modernist Fiction' },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', genre: 'Classic Literature' },
  { title: 'The Sun Also Rises', author: 'Ernest Hemingway', genre: 'Classic Literature' },
  { title: 'A Farewell to Arms', author: 'Ernest Hemingway', genre: 'Classic Literature' },
  { title: 'For Whom the Bell Tolls', author: 'Ernest Hemingway', genre: 'Classic Literature' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic Literature' },
  { title: 'Tender Is the Night', author: 'F. Scott Fitzgerald', genre: 'Classic Literature' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic Literature' },
  { title: 'Catch-22', author: 'Joseph Heller', genre: 'Classic Satire' },
  { title: 'The Art of War', author: 'Sun Tzu', genre: 'Military Strategy' },
  { title: 'Walden', author: 'Henry David Thoreau', genre: 'Philosophy / Nature' },
  { title: 'Civil Disobedience', author: 'Henry David Thoreau', genre: 'Political Philosophy' },
  { title: 'Self-Reliance', author: 'Ralph Waldo Emerson', genre: 'Philosophy / Transcendentalism' },
  { title: 'War and Peace', author: 'Leo Tolstoy', genre: 'Historical Epic' },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', genre: 'Classic Literature' },
  { title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy', genre: 'Philosophical Novella' },
  { title: 'Les Misérables', author: 'Victor Hugo', genre: 'Historical Classic' },
  { title: 'The Hunchback of Notre-Dame', author: 'Victor Hugo', genre: 'Gothic Romance' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', genre: 'Adventure Classic' },
  { title: 'The Three Musketeers', author: 'Alexandre Dumas', genre: 'Adventure Classic' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Classic Romance' },
  { title: 'Sense and Sensibility', author: 'Jane Austen', genre: 'Classic Romance' },
  { title: 'Emma', author: 'Jane Austen', genre: 'Classic Comedy' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', genre: 'Gothic Classic' },
  { title: 'Wuthering Heights', author: 'Emily Brontë', genre: 'Gothic Tragedy' },
  { title: 'Great Expectations', author: 'Charles Dickens', genre: 'Victorian Classic' },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens', genre: 'Historical Classic' },
  { title: 'David Copperfield', author: 'Charles Dickens', genre: 'Victorian Classic' },
  { title: 'Oliver Twist', author: 'Charles Dickens', genre: 'Victorian Classic' },
  { title: 'Moby-Dick', author: 'Herman Melville', genre: 'Epic Literature' },
  { title: 'Frankenstein', author: 'Mary Shelley', genre: 'Gothic Sci-Fi' },
  { title: 'Dracula', author: 'Bram Stoker', genre: 'Gothic Horror' },
  { title: 'Don Quixote', author: 'Miguel de Cervantes', genre: 'Classic Adventure' },
  { title: 'Madame Bovary', author: 'Gustave Flaubert', genre: 'Realism Classic' },
  { title: 'The Odyssey', author: 'Homer', genre: 'Ancient Epic' },
  { title: 'The Iliad', author: 'Homer', genre: 'Ancient Epic' },
  { title: 'The Divine Comedy', author: 'Dante Alighieri', genre: 'Epic Poetry' },
  { title: 'Heart of Darkness', author: 'Joseph Conrad', genre: 'Literary Novella' },
  { title: 'Fathers and Sons', author: 'Ivan Turgenev', genre: 'Russian Classic' },
  { title: 'The Master and Margarita', author: 'Mikhail Bulgakov', genre: 'Magical Realism' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', genre: 'Magical Realism' },
  { title: 'Love in the Time of Cholera', author: 'Gabriel García Márquez', genre: 'Magical Realism' },
  { title: 'The Sound and the Fury', author: 'William Faulkner', genre: 'Southern Gothic' },
  { title: 'Ulysses', author: 'James Joyce', genre: 'Modernist Masterpiece' },
  { title: 'Dubliners', author: 'James Joyce', genre: 'Short Stories' },
  { title: 'Mrs. Dalloway', author: 'Virginia Woolf', genre: 'Modernist Fiction' },
  { title: 'To the Lighthouse', author: 'Virginia Woolf', genre: 'Modernist Fiction' },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck', genre: 'American Classic' },
  { title: 'East of Eden', author: 'John Steinbeck', genre: 'Epic Drama' },
  { title: 'Of Mice and Men', author: 'John Steinbeck', genre: 'Classic Novella' },
  { title: 'Invisible Man', author: 'Ralph Ellison', genre: 'Literary Classic' },
  { title: 'Beloved', author: 'Toni Morrison', genre: 'Literary Fiction' },
  { title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'African Literature' },
  { title: 'The Name of the Rose', author: 'Umberto Eco', genre: 'Historical Mystery' },
  { title: 'Tao Te Ching', author: 'Lao Tzu', genre: 'Eastern Philosophy' },
  { title: 'The Analects', author: 'Confucius', genre: 'Eastern Philosophy' },
  { title: 'The Bhagavad Gita', author: 'Vyasa', genre: 'Ancient Sacred Text' },
  { title: 'Ethics', author: 'Baruch Spinoza', genre: 'Rationalist Philosophy' },
  { title: 'Meditations on First Philosophy', author: 'René Descartes', genre: 'Philosophy' },
  { title: 'Leviathan', author: 'Thomas Hobbes', genre: 'Political Theory' },
  { title: 'Critique of Pure Reason', author: 'Immanuel Kant', genre: 'Epistemology' },
  { title: 'Fear and Trembling', author: 'Søren Kierkegaard', genre: 'Christian Existentialism' },
  { title: 'Being and Nothingness', author: 'Jean-Paul Sartre', genre: 'Existential Philosophy' },
  { title: 'Nausea', author: 'Jean-Paul Sartre', genre: 'Philosophical Fiction' },

  // History, Science & Non-Fiction
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', genre: 'History / Anthropology' },
  { title: 'Homo Deus: A Brief History of Tomorrow', author: 'Yuval Noah Harari', genre: 'Futurism / Philosophy' },
  { title: '21 Lessons for the 21st Century', author: 'Yuval Noah Harari', genre: 'Current Affairs / Philosophy' },
  { title: 'Nexus: A Brief History of Information Networks', author: 'Yuval Noah Harari', genre: 'History / Technology' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', genre: 'History / Anthropology' },
  { title: 'Collapse: How Societies Choose to Fail or Succeed', author: 'Jared Diamond', genre: 'Environmental History' },
  { title: 'Educated', author: 'Tara Westover', genre: 'Memoir' },
  { title: 'Born a Crime', author: 'Trevor Noah', genre: 'Memoir / Biography' },
  { title: 'Killers of the Flower Moon', author: 'David Grann', genre: 'History / True Crime' },
  { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', genre: 'Popular Science' },
  { title: 'The Body: A Guide for Occupants', author: 'Bill Bryson', genre: 'Science / Anatomy' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', genre: 'Science / History' },
  { title: 'Bad Blood: Secrets and Lies in a Silicon Valley Startup', author: 'John Carreyrou', genre: 'Investigative Journalism' },
  { title: 'Shoe Dog', author: 'Phil Knight', genre: 'Business Memoir' },
  { title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'Elon Musk', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'Leonardo da Vinci', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'Benjamin Franklin: An American Life', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'Einstein: His Life and Universe', author: 'Walter Isaacson', genre: 'Biography' },
  { title: 'The Innovators', author: 'Walter Isaacson', genre: 'History of Technology' },
  { title: 'The Code Breaker', author: 'Walter Isaacson', genre: 'Biotechnology' },
  { title: 'The Wright Brothers', author: 'David McCullough', genre: 'History / Biography' },
  { title: 'Cosmos', author: 'Carl Sagan', genre: 'Popular Science' },
  { title: 'Pale Blue Dot', author: 'Carl Sagan', genre: 'Astronomy / Philosophy' },
  { title: 'The Demon-Haunted World', author: 'Carl Sagan', genre: 'Scientific Skepticism' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Cosmology / Physics' },
  { title: 'The Universe in a Nutshell', author: 'Stephen Hawking', genre: 'Theoretical Physics' },
  { title: 'The Gene: An Intimate History', author: 'Siddhartha Mukherjee', genre: 'Science / Medicine' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee', genre: 'Science / Medicine' },
  { title: 'Endurance: Shackleton’s Incredible Voyage', author: 'Alfred Lansing', genre: 'History / Adventure' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', genre: 'Evolutionary Biology' },
  { title: 'The Blind Watchmaker', author: 'Richard Dawkins', genre: 'Evolutionary Biology' },
  { title: 'The Origin of Species', author: 'Charles Darwin', genre: 'Natural Science' },
  { title: 'Surely You’re Joking, Mr. Feynman!', author: 'Richard P. Feynman', genre: 'Memoir / Science' },
  { title: 'Seven Brief Lessons on Physics', author: 'Carlo Rovelli', genre: 'Modern Physics' },
  { title: 'The Order of Time', author: 'Carlo Rovelli', genre: 'Theoretical Physics' },
  { title: 'The Man Who Mistook His Wife for a Hat', author: 'Oliver Sacks', genre: 'Neurology / Psychology' },
  { title: 'An Immense World', author: 'Ed Yong', genre: 'Zoology / Senses' },
  { title: 'The Sixth Extinction', author: 'Elizabeth Kolbert', genre: 'Environmental Science' },
  { title: 'Silent Spring', author: 'Rachel Carson', genre: 'Ecology / Non-Fiction' },
  { title: 'The Dawn of Everything', author: 'David Graeber', genre: 'Anthropology / History' },
  { title: 'Debt: The First 5,000 Years', author: 'David Graeber', genre: 'Economic Anthropology' },
  { title: 'The Silk Roads', author: 'Peter Frankopan', genre: 'Global History' },
  { title: 'The Guns of August', author: 'Barbara W. Tuchman', genre: 'Military History' },
  { title: 'A Distant Mirror: The Calamitous 14th Century', author: 'Barbara W. Tuchman', genre: 'Medieval History' },
  { title: 'The Rise and Fall of the Third Reich', author: 'William L. Shirer', genre: 'World War II History' },
  { title: 'The Warmth of Other Suns', author: 'Isabel Wilkerson', genre: 'Social History' },
  { title: 'Team of Rivals', author: 'Doris Kearns Goodwin', genre: 'Presidential Biography' },
  { title: 'Alexander Hamilton', author: 'Ron Chernow', genre: 'Historical Biography' },
  { title: 'Titan: The Life of John D. Rockefeller, Sr.', author: 'Ron Chernow', genre: 'Business Biography' },

  // Mystery, Thriller & Suspense
  { title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Psychological Thriller' },
  { title: 'The Maidens', author: 'Alex Michaelides', genre: 'Psychological Mystery' },
  { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Psychological Thriller' },
  { title: 'Sharp Objects', author: 'Gillian Flynn', genre: 'Psychological Thriller' },
  { title: 'Dark Places', author: 'Gillian Flynn', genre: 'Mystery / Thriller' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', genre: 'Crime Thriller' },
  { title: 'The Girl Who Played with Fire', author: 'Stieg Larsson', genre: 'Crime Thriller' },
  { title: 'The Girl Who Kicked the Hornet’s Nest', author: 'Stieg Larsson', genre: 'Crime Thriller' },
  { title: 'And Then There Were None', author: 'Agatha Christie', genre: 'Classic Mystery' },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', genre: 'Detective Mystery' },
  { title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie', genre: 'Classic Detective' },
  { title: 'Death on the Nile', author: 'Agatha Christie', genre: 'Detective Mystery' },
  { title: 'The ABC Murders', author: 'Agatha Christie', genre: 'Classic Mystery' },
  { title: 'The Da Vinci Code', author: 'Dan Brown', genre: 'Conspiracy Thriller' },
  { title: 'Angels & Demons', author: 'Dan Brown', genre: 'Conspiracy Thriller' },
  { title: 'Big Little Lies', author: 'Liane Moriarty', genre: 'Mystery / Drama' },
  { title: 'Verity', author: 'Colleen Hoover', genre: 'Psychological Thriller' },
  { title: 'The Thursday Murder Club', author: 'Richard Osman', genre: 'Cozy Mystery' },
  { title: 'The Man Who Died Twice', author: 'Richard Osman', genre: 'Cozy Mystery' },
  { title: 'The Maid', author: 'Nita Prose', genre: 'Mystery' },
  { title: 'The Guest List', author: 'Lucy Foley', genre: 'Mystery Thriller' },
  { title: 'The Paris Apartment', author: 'Lucy Foley', genre: 'Mystery Thriller' },
  { title: 'In Cold Blood', author: 'Truman Capote', genre: 'True Crime Classic' },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', genre: 'Detective Fiction' },
  { title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', genre: 'Detective Fiction' },
  { title: 'The Sign of the Four', author: 'Arthur Conan Doyle', genre: 'Detective Fiction' },
  { title: 'Shutter Island', author: 'Dennis Lehane', genre: 'Psychological Thriller' },
  { title: 'Mystic River', author: 'Dennis Lehane', genre: 'Crime Drama' },
  { title: 'The Girl on the Train', author: 'Paula Hawkins', genre: 'Psychological Thriller' },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett', genre: 'Hardboiled Noir' },
  { title: 'The Big Sleep', author: 'Raymond Chandler', genre: 'Noir Detective' },
  { title: 'Farewell, My Lovely', author: 'Raymond Chandler', genre: 'Noir Detective' },
  { title: 'Rebecca', author: 'Daphne du Maurier', genre: 'Gothic Mystery' },
  { title: 'The Silence of the Lambs', author: 'Thomas Harris', genre: 'Psychological Horror' },
  { title: 'Red Dragon', author: 'Thomas Harris', genre: 'Psychological Thriller' },
  { title: 'The Talented Mr. Ripley', author: 'Patricia Highsmith', genre: 'Psychological Suspense' },
  { title: 'Strangers on a Train', author: 'Patricia Highsmith', genre: 'Psychological Suspense' },
  { title: 'The Snowman', author: 'Jo Nesbø', genre: 'Nordic Noir' },
  { title: 'In the Woods', author: 'Tana French', genre: 'Psychological Mystery' },
  { title: 'The Woman in the Window', author: 'A.J. Finn', genre: 'Psychological Thriller' },

  // Contemporary & Literary Fiction
  { title: 'The Midnight Library', author: 'Matt Haig', genre: 'Literary Fiction' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', genre: 'Literary Mystery' },
  { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction' },
  { title: 'Daisy Jones & The Six', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction' },
  { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', genre: 'Literary Fiction' },
  { title: 'Lessons in Chemistry', author: 'Bonnie Garmus', genre: 'Historical Fiction' },
  { title: 'The Song of Achilles', author: 'Madeline Miller', genre: 'Mythological Fiction' },
  { title: 'Circe', author: 'Madeline Miller', genre: 'Mythological Fiction' },
  { title: 'Normal People', author: 'Sally Rooney', genre: 'Literary Fiction' },
  { title: 'Conversations with Friends', author: 'Sally Rooney', genre: 'Literary Fiction' },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Literary Fiction' },
  { title: 'Never Let Me Go', author: 'Kazuo Ishiguro', genre: 'Dystopian Fiction' },
  { title: 'The Remains of the Day', author: 'Kazuo Ishiguro', genre: 'Literary Fiction' },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Philosophical Fiction' },
  { title: 'There Are Rivers in the Sky', author: 'Elif Shafak', genre: 'Literary Fiction' },
  { title: 'The Bastard of Istanbul', author: 'Elif Shafak', genre: 'Literary Fiction' },
  { title: 'The Book Thief', author: 'Markus Zusak', genre: 'Historical Fiction' },
  { title: 'All the Light We Cannot See', author: 'Anthony Doerr', genre: 'Historical Fiction' },
  { title: 'Cloud Cuckoo Land', author: 'Anthony Doerr', genre: 'Historical Fiction' },
  { title: 'A Gentleman in Moscow', author: 'Amor Towles', genre: 'Historical Fiction' },
  { title: 'The Lincoln Highway', author: 'Amor Towles', genre: 'Historical Fiction' },
  { title: 'Yellowface', author: 'R.F. Kuang', genre: 'Satire / Literary' },
  { title: 'Babel: An Arcane History', author: 'R.F. Kuang', genre: 'Historical Fantasy' },
  { title: 'Demon Copperhead', author: 'Barbara Kingsolver', genre: 'Literary Fiction' },
  { title: 'The Poisonwood Bible', author: 'Barbara Kingsolver', genre: 'Literary Fiction' },
  { title: 'Sea of Tranquility', author: 'Emily St. John Mandel', genre: 'Literary Fiction' },
  { title: 'Station Eleven', author: 'Emily St. John Mandel', genre: 'Post-Apocalyptic' },
  { title: 'The Glass Hotel', author: 'Emily St. John Mandel', genre: 'Literary Fiction' },
  { title: 'The Overstory', author: 'Richard Powers', genre: 'Literary Fiction' },
  { title: 'A Man Called Ove', author: 'Fredrik Backman', genre: 'Contemporary Fiction' },
  { title: 'Anxious People', author: 'Fredrik Backman', genre: 'Contemporary Fiction' },
  { title: 'Pachinko', author: 'Min Jin Lee', genre: 'Historical Fiction' },
  { title: 'Free Food for Millionaires', author: 'Min Jin Lee', genre: 'Contemporary Fiction' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami', genre: 'Magical Realism' },
  { title: 'Norwegian Wood', author: 'Haruki Murakami', genre: 'Literary Fiction' },
  { title: '1Q84', author: 'Haruki Murakami', genre: 'Magical Realism' },
  { title: 'The Wind-Up Bird Chronicle', author: 'Haruki Murakami', genre: 'Magical Realism' },
  { title: 'Before the Coffee Gets Cold', author: 'Toshikazu Kawaguchi', genre: 'Magical Realism' },
  { title: 'The Shadow of the Wind', author: 'Carlos Ruiz Zafón', genre: 'Gothic Mystery' },
  { title: 'Atonement', author: 'Ian McEwan', genre: 'Historical Drama' }
];

const POPULAR_SUBJECTS = [
  'classic_literature',
  'fiction',
  'science_fiction',
  'fantasy',
  'philosophy',
  'psychology',
  'history',
  'biography',
  'mystery_and_detective_stories',
  'thriller',
  'historical_fiction',
  'science',
  'self-help',
  'business',
  'romance',
  'adventure'
];

function slugify(text, fallback = 'volume') {
  const normalized = String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return normalized || fallback;
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'LibPDF-BookCatalog/2.0 (https://libpdf.pages.dev; automated-bot@libpdf.pages.dev)',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function scrapeBookMetadata(item) {
  const query = `${item.title} ${item.author}`;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;

  const fallbackSlug = slugify(item.title);
  const fallbackAuthorSlug = slugify(item.author);
  const colorIndex = Math.abs(fallbackSlug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 12;

  try {
    const res = await fetchWithTimeout(url, {}, 9000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const doc = data.docs && data.docs.length > 0 ? data.docs[0] : null;

    const title = item.title;
    const author = item.author || (doc?.author_name ? doc.author_name[0] : 'Unknown Author');
    const year = doc?.first_publish_year || 2020;
    const pages = doc?.number_of_pages_median || (doc?.number_of_pages ? doc.number_of_pages[0] : (280 + (colorIndex * 15)));
    const coverId = doc?.cover_i || item.cover_id;
    const coverImage = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : undefined;

    const slug = slugify(title);
    const authorSlug = slugify(author);
    const ia = doc?.ia && doc.ia.length > 0 ? doc.ia[0] : item.ia;

    let readOnlineUrl = undefined;
    let previewUrl = doc?.key ? `https://openlibrary.org${doc.key}` : undefined;
    let downloadUrl = undefined;
    let downloadPdfUrl = undefined;
    let downloadEpubUrl = undefined;
    let isPublicDomain = Boolean(doc?.public_scan_b || item.public_scan);
    let openSourceProvider = 'Internet Archive (Open Access)';

    if (ia) {
      readOnlineUrl = `https://archive.org/stream/${ia}`;
      previewUrl = `https://archive.org/details/${ia}`;
      downloadUrl = `https://archive.org/download/${ia}/${ia}.epub`;
      downloadPdfUrl = `https://archive.org/download/${ia}/${ia}.pdf`;
      downloadEpubUrl = `https://archive.org/download/${ia}/${ia}.epub`;
      openSourceProvider = isPublicDomain
        ? 'Internet Archive (Public Domain Archive)'
        : 'Internet Archive (Full Open Access)';
    } else {
      const cleanId = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      downloadPdfUrl = `https://archive.org/download/${cleanId}/${cleanId}.pdf`;
      downloadEpubUrl = `https://archive.org/download/${cleanId}/${cleanId}.epub`;
      readOnlineUrl = `https://archive.org/stream/${cleanId}`;
      openSourceProvider = 'Open Digital Library';
    }

    const synopsis =
      doc?.first_sentence && typeof doc.first_sentence[0] === 'string'
        ? doc.first_sentence[0]
        : item.synopsis || `A celebrated work of ${item.genre} by ${author}. Published in ${year}.`;

    const rating = Math.min(5, Math.max(4, 4 + ((colorIndex % 3) * 0.5)));
    const fileSize = `${(1.2 + ((colorIndex * 0.25))).toFixed(1)} MB`;
    const downloadCount = 1500 + ((colorIndex * 710) % 5200);

    return {
      id: slug,
      slug,
      title,
      author,
      authorSlug,
      year: Number(year) || 2020,
      genre: item.genre || 'Classic Literature',
      pages: Number(pages) || 320,
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
      fileSize,
      downloadCount,
    };
  } catch (err) {
    console.warn(`[Scraper] Fallback for "${item.title}":`, err.message);
    const cleanId = fallbackSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    return {
      id: fallbackSlug,
      slug: fallbackSlug,
      title: item.title,
      author: item.author,
      authorSlug: fallbackAuthorSlug,
      year: 2021,
      genre: item.genre || 'Classic Literature',
      pages: 320,
      rating: 4.5,
      status: 'want_to_read',
      coverImage: item.cover_id ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg` : undefined,
      colorIndex,
      synopsis: `A celebrated work of ${item.genre} by ${item.author}. Available in open-access digital editions.`,
      downloadPdfUrl: `https://archive.org/download/${cleanId}/${cleanId}.pdf`,
      downloadEpubUrl: `https://archive.org/download/${cleanId}/${cleanId}.epub`,
      readOnlineUrl: `https://archive.org/stream/${cleanId}`,
      fileSize: '2.2 MB',
      openSourceProvider: 'Open Digital Library',
      downloadCount: 2400
    };
  }
}

async function discoverDynamicOpenLibraryCandidates(existingSlugs, existingTitles, neededCount) {
  const dynamicCandidates = [];
  console.log(`[Discovery] Querying Open Library Subject catalog for fresh candidates...`);

  // Choose a random or rotating starting subject
  const shuffledSubjects = [...POPULAR_SUBJECTS].sort(() => 0.5 - Math.random());

  for (const subject of shuffledSubjects) {
    if (dynamicCandidates.length >= neededCount) break;

    const offset = Math.floor(Math.random() * 5) * 20; // 0, 20, 40, 60, 80
    const url = `https://openlibrary.org/subjects/${subject}.json?limit=30&offset=${offset}`;

    try {
      const res = await fetchWithTimeout(url, {}, 7000);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.works || !Array.isArray(data.works)) continue;

      for (const work of data.works) {
        if (!work.title) continue;
        const slug = slugify(work.title);
        const norm = normalizeTitle(work.title);
        const author = work.authors && work.authors.length > 0 ? work.authors[0].name : 'Unknown Author';

        if (existingSlugs.has(slug) || existingTitles.has(norm)) continue;
        if (dynamicCandidates.some((c) => c.slug === slug || normalizeTitle(c.title) === norm)) continue;

        // Friendly genre name
        const cleanGenre = subject
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        dynamicCandidates.push({
          title: work.title,
          author,
          genre: cleanGenre,
          cover_id: work.cover_id,
          ia: work.ia,
          public_scan: work.public_scan,
          slug,
        });

        if (dynamicCandidates.length >= neededCount) break;
      }
    } catch (e) {
      console.warn(`[Discovery] Subject fetch error for ${subject}: ${e.message}`);
    }

    // Polite pause between subject queries
    await new Promise((r) => setTimeout(r, 200));
  }

  return dynamicCandidates;
}

async function run() {
  // Parse command line count: e.g. --count=50
  const countArg = process.argv.find((a) => a.startsWith('--count='));
  const targetCount = countArg ? parseInt(countArg.split('=')[1], 10) : parseInt(process.env.BOOKS_COUNT || '50', 10);
  const BOOKS_TO_ADD = isNaN(targetCount) || targetCount <= 0 ? 50 : targetCount;

  console.log(`\n=======================================================`);
  console.log(`📚 LibPDF Daily Catalog Updater`);
  console.log(`🎯 Target new books to ingest today: ${BOOKS_TO_ADD}`);
  console.log(`=======================================================\n`);

  // 1. Load current catalog
  const dataDir = path.resolve('src', 'data');
  const catalogPath = path.join(dataDir, 'public-books.json');
  const publicPath = path.resolve('public', 'books.json');

  let existingCatalog = [];
  if (fs.existsSync(catalogPath)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    } catch {
      existingCatalog = [];
    }
  } else if (fs.existsSync(publicPath)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    } catch {
      existingCatalog = [];
    }
  }

  const existingSlugs = new Set(existingCatalog.map((b) => b.slug || b.id));
  const existingTitles = new Set(existingCatalog.map((b) => normalizeTitle(b.title)));
  console.log(`Current catalog size: ${existingCatalog.length} books.`);

  // 2. Select candidates not yet in catalog
  const candidates = [];

  // Check master curated list first
  for (const item of CURATED_TITLES) {
    const slug = slugify(item.title);
    const norm = normalizeTitle(item.title);
    if (!existingSlugs.has(slug) && !existingTitles.has(norm) && !candidates.some((c) => slugify(c.title) === slug)) {
      candidates.push(item);
      if (candidates.length >= BOOKS_TO_ADD) break;
    }
  }

  console.log(`Found ${candidates.length} candidate books from curated world collection.`);

  // If curated candidates are less than BOOKS_TO_ADD, discover dynamically from Open Library
  if (candidates.length < BOOKS_TO_ADD) {
    const needed = BOOKS_TO_ADD - candidates.length;
    console.log(`Gathering ${needed} more books from dynamic Open Library catalog discovery...`);
    const dynamic = await discoverDynamicOpenLibraryCandidates(existingSlugs, existingTitles, needed);
    candidates.push(...dynamic);
  }

  const selectedCandidates = candidates.slice(0, BOOKS_TO_ADD);
  console.log(`\nStarting ingestion of ${selectedCandidates.length} new books...\n`);

  // 3. Ingest books in polite batches of 5
  const newlyScrapedBooks = [];
  const batchSize = 5;

  for (let i = 0; i < selectedCandidates.length; i += batchSize) {
    const chunk = selectedCandidates.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map((item) => scrapeBookMetadata(item)));

    for (const b of results) {
      // Ensure unique slug
      let finalSlug = b.slug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${b.slug}-${counter}`;
        counter++;
      }
      b.slug = finalSlug;
      b.id = finalSlug;
      existingSlugs.add(finalSlug);
      newlyScrapedBooks.push(b);
    }

    const progress = Math.min(newlyScrapedBooks.length, selectedCandidates.length);
    console.log(`Ingested: ${progress}/${selectedCandidates.length} new books...`);

    // Polite delay to protect Open Library API
    await new Promise((r) => setTimeout(r, 250));
  }

  if (newlyScrapedBooks.length === 0) {
    console.log(`Catalog is already complete. No new books needed.`);
    return;
  }

  // 4. Merge and save
  const updatedCatalog = [...existingCatalog, ...newlyScrapedBooks];

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2), 'utf8');
  fs.writeFileSync(publicPath, JSON.stringify(updatedCatalog, null, 2), 'utf8');

  console.log(`\n=======================================================`);
  console.log(`🎉 SUCCESS! Added ${newlyScrapedBooks.length} new books to catalog.`);
  console.log(`📈 Total books in catalog: ${existingCatalog.length} ➜ ${updatedCatalog.length}`);
  console.log(`💾 Saved to: ${catalogPath}`);
  console.log(`💾 Saved to: ${publicPath}`);
  console.log(`=======================================================\n`);

  // 5. Automatically regenerate sitemaps to reflect the newly added books
  try {
    console.log(`Regenerating sitemaps for updated catalog...`);
    execSync('node scripts/generate-sitemaps.mjs', { stdio: 'inherit' });
    console.log(`Sitemaps successfully synchronized!`);
  } catch (err) {
    console.warn(`Sitemap generation notice:`, err.message);
  }
}

run();
