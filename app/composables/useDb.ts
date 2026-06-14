import Dexie, { type Table } from 'dexie'

export interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  amazonUrl?: string
  asin?: string
  isbn?: string
  googleBooksId?: string
  seriesId?: string
  seriesPosition?: number
  status: 'want_to_read' | 'reading' | 'read' | 'abandoned'
  genre?: string
  description?: string
  pageCount?: number
  publisher?: string
  publishedDate?: string
  language?: string
  dateAdded: number
}

export interface Series {
  id: string
  name: string
  author: string
  knownTotal?: number
  googleBooksQueryName?: string
  lastChecked?: number
  nextBookTitle?: string
  nextBookDate?: string
  newReleaseAvailable: boolean
}

export interface Review {
  id: string
  bookId: string
  rating?: number
  reviewText?: string
  containsSpoilers: boolean
  dateRead?: number
  updatedAt: number
}

export interface Tag {
  id: string
  label: string
  color: string
}

export interface BookTag {
  bookId: string
  tagId: string
}

export class BookshelfDB extends Dexie {
  books!: Table<Book>
  series!: Table<Series>
  reviews!: Table<Review>
  tags!: Table<Tag>
  bookTags!: Table<BookTag>

  constructor() {
    super('bookshelf')
    this.version(1).stores({
      books: '&id, status, seriesId, author, dateAdded',
      series: '&id, name, author',
      reviews: '&id, bookId, dateRead',
      tags: '&id, label',
      bookTags: '[bookId+tagId], bookId, tagId',
    })
  }
}

export const db = new BookshelfDB()
