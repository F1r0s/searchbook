import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'BookSearch – A private reading tracker',
  description: 'A private reading tracker: log your books, write notes with pictures, keep the words you learn and see your reading add up.',
  openGraph: {
    title: 'BookSearch – A private reading tracker',
    description: 'A private reading tracker: log your books, write notes with pictures, keep the words you learn and see your reading add up.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookSearch – A private reading tracker',
    description: 'A private reading tracker: log your books, write notes with pictures, keep the words you learn and see your reading add up.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
