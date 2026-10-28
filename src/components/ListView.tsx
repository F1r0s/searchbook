import React from 'react';
import { Book } from '../types';
import { AnimatedDownloadTable } from './AnimatedDownloadTable';

interface Props {
  books: Book[];
  onSelect: (id: string) => void;
  onDownload?: (book: Book, format: 'pdf' | 'epub') => void;
}

export default function ListView({ books, onSelect, onDownload }: Props) {
  if (books.length === 0) {
    return <p className="empty-note">No records found.</p>;
  }

  return (
    <AnimatedDownloadTable
      books={books}
      onSelect={onSelect}
      onDownload={onDownload}
    />
  );
}
