import React, { CSSProperties, useState } from 'react';
import { Book } from '../types';
import { paletteFor } from '../lib/palette';

interface Props {
  book: {
    title: string;
    author: string;
    genre?: string;
    coverImage?: string;
    coverColor?: string;
    colorIndex?: number;
    [key: string]: any;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function BookCover({ book, size = 'md' }: Props) {
  const [imgError, setImgError] = useState(false);

  if (book.coverImage && !imgError) {
    return (
      <div className={`cover cover--image cover--${size}`}>
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Derive colorIndex from colorIndex or hash of title/author
  const colorIndex =
    typeof book.colorIndex === 'number'
      ? book.colorIndex
      : Math.abs(
          book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        );

  const c = paletteFor(colorIndex);
  const style = {
    '--spine-bg': book.coverColor || c.bg,
    '--spine-deep': c.deep,
    '--spine-ink': c.ink,
  } as CSSProperties;

  return (
    <div className={`cover cover--${size}`} style={style}>
      <span className="cover-topline">{book.genre ?? ' '}</span>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
    </div>
  );
}
