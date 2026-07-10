import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

type BookStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned'

export interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  amazonUrl?: string
  amazonSeriesUrl?: string
  asin?: string
  seriesId?: string
  seriesPosition?: number
  status: BookStatus
  genre?: string
  description?: string
  publishedDate?: string
  publisher?: string
  pageCount?: number
  dateAdded: number
}

export interface Series {
  id: string
  name: string
  author?: string
  amazonUrl?: string
  knownTotal?: number
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

let db: Database.Database

export function initDb(): Database.Database {
  const dbPath = join(app.getPath('userData'), 'bookshelf.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  createTables()
  return db
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      author TEXT,
      amazon_url TEXT,
      known_total INTEGER,
      last_checked INTEGER,
      next_book_title TEXT,
      next_book_date TEXT,
      new_release_available INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_url TEXT,
      amazon_url TEXT,
      amazon_series_url TEXT,
      asin TEXT,
      series_id TEXT REFERENCES series(id),
      series_position INTEGER,
      status TEXT NOT NULL DEFAULT 'want_to_read',
      genre TEXT,
      description TEXT,
      published_date TEXT,
      publisher TEXT,
      page_count INTEGER,
      date_added INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      rating INTEGER,
      review_text TEXT,
      contains_spoilers INTEGER NOT NULL DEFAULT 0,
      date_read INTEGER,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_tags (
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, tag_id)
    );
  `)
}

function rowToBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    coverUrl: (row.cover_url as string) || undefined,
    amazonUrl: (row.amazon_url as string) || undefined,
    amazonSeriesUrl: (row.amazon_series_url as string) || undefined,
    asin: (row.asin as string) || undefined,
    seriesId: (row.series_id as string) || undefined,
    seriesPosition: (row.series_position as number) || undefined,
    status: row.status as BookStatus,
    genre: (row.genre as string) || undefined,
    description: (row.description as string) || undefined,
    publishedDate: (row.published_date as string) || undefined,
    publisher: (row.publisher as string) || undefined,
    pageCount: (row.page_count as number) || undefined,
    dateAdded: row.date_added as number,
  }
}

function rowToSeries(row: Record<string, unknown>): Series {
  return {
    id: row.id as string,
    name: row.name as string,
    author: (row.author as string) || undefined,
    amazonUrl: (row.amazon_url as string) || undefined,
    knownTotal: (row.known_total as number) || undefined,
    lastChecked: (row.last_checked as number) || undefined,
    nextBookTitle: (row.next_book_title as string) || undefined,
    nextBookDate: (row.next_book_date as string) || undefined,
    newReleaseAvailable: !!(row.new_release_available as number),
  }
}

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    bookId: row.book_id as string,
    rating: (row.rating as number) || undefined,
    reviewText: (row.review_text as string) || undefined,
    containsSpoilers: !!(row.contains_spoilers as number),
    dateRead: (row.date_read as number) || undefined,
    updatedAt: row.updated_at as number,
  }
}

// ---- Books ----

export function getAllBooks(): Book[] {
  return (db.prepare('SELECT * FROM books ORDER BY date_added DESC').all() as Record<string, unknown>[]).map(rowToBook)
}

export function getBook(id: string): Book | undefined {
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? rowToBook(row) : undefined
}

export function saveBook(book: Book): void {
  db.prepare(`
    INSERT OR REPLACE INTO books
      (id, title, author, cover_url, amazon_url, amazon_series_url, asin,
       series_id, series_position, status, genre, description, published_date,
       publisher, page_count, date_added)
    VALUES
      (@id, @title, @author, @coverUrl, @amazonUrl, @amazonSeriesUrl, @asin,
       @seriesId, @seriesPosition, @status, @genre, @description, @publishedDate,
       @publisher, @pageCount, @dateAdded)
  `).run({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl ?? null,
    amazonUrl: book.amazonUrl ?? null,
    amazonSeriesUrl: book.amazonSeriesUrl ?? null,
    asin: book.asin ?? null,
    seriesId: book.seriesId ?? null,
    seriesPosition: book.seriesPosition ?? null,
    status: book.status,
    genre: book.genre ?? null,
    description: book.description ?? null,
    publishedDate: book.publishedDate ?? null,
    publisher: book.publisher ?? null,
    pageCount: book.pageCount ?? null,
    dateAdded: book.dateAdded,
  })
}

export function updateBook(id: string, data: Partial<Book>): void {
  const existing = getBook(id)
  if (!existing) return
  saveBook({ ...existing, ...data })
}

export function deleteBook(id: string): void {
  db.prepare('DELETE FROM books WHERE id = ?').run(id)
}

// ---- Series ----

export function getAllSeries(): Series[] {
  return (db.prepare('SELECT * FROM series ORDER BY name').all() as Record<string, unknown>[]).map(rowToSeries)
}

export function getSeriesById(id: string): Series | undefined {
  const row = db.prepare('SELECT * FROM series WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? rowToSeries(row) : undefined
}

export function saveSeries(series: Series): void {
  db.prepare(`
    INSERT OR REPLACE INTO series
      (id, name, author, amazon_url, known_total, last_checked,
       next_book_title, next_book_date, new_release_available)
    VALUES
      (@id, @name, @author, @amazonUrl, @knownTotal, @lastChecked,
       @nextBookTitle, @nextBookDate, @newReleaseAvailable)
  `).run({
    id: series.id,
    name: series.name,
    author: series.author ?? null,
    amazonUrl: series.amazonUrl ?? null,
    knownTotal: series.knownTotal ?? null,
    lastChecked: series.lastChecked ?? null,
    nextBookTitle: series.nextBookTitle ?? null,
    nextBookDate: series.nextBookDate ?? null,
    newReleaseAvailable: series.newReleaseAvailable ? 1 : 0,
  })
}

export function updateSeries(id: string, data: Partial<Series>): void {
  const existing = getSeriesById(id)
  if (!existing) return
  saveSeries({ ...existing, ...data })
}

export function deleteSeries(id: string): void {
  db.transaction(() => {
    db.prepare('UPDATE books SET series_id = NULL, series_position = NULL WHERE series_id = ?').run(id)
    db.prepare('DELETE FROM series WHERE id = ?').run(id)
  })()
}

// ---- Reviews ----

export function getAllReviews(): Review[] {
  return (db.prepare('SELECT * FROM reviews').all() as Record<string, unknown>[]).map(rowToReview)
}

export function getReview(bookId: string): Review | undefined {
  const row = db.prepare('SELECT * FROM reviews WHERE book_id = ?').get(bookId) as Record<string, unknown> | undefined
  return row ? rowToReview(row) : undefined
}

export function saveReview(review: Review): void {
  db.prepare(`
    INSERT OR REPLACE INTO reviews
      (id, book_id, rating, review_text, contains_spoilers, date_read, updated_at)
    VALUES
      (@id, @bookId, @rating, @reviewText, @containsSpoilers, @dateRead, @updatedAt)
  `).run({
    id: review.id,
    bookId: review.bookId,
    rating: review.rating ?? null,
    reviewText: review.reviewText ?? null,
    containsSpoilers: review.containsSpoilers ? 1 : 0,
    dateRead: review.dateRead ?? null,
    updatedAt: review.updatedAt,
  })
}

// ---- Tags ----

export function getAllTags(): Tag[] {
  return db.prepare('SELECT * FROM tags ORDER BY label').all() as Tag[]
}

export function saveTag(tag: Tag): void {
  db.prepare('INSERT OR REPLACE INTO tags (id, label, color) VALUES (@id, @label, @color)').run(tag)
}

export function updateTag(id: string, data: Partial<Tag>): void {
  const existing = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as Tag | undefined
  if (!existing) return
  saveTag({ ...existing, ...data })
}

export function deleteTag(id: string): void {
  db.prepare('DELETE FROM tags WHERE id = ?').run(id)
}

// ---- BookTags ----

export function getAllBookTags(): BookTag[] {
  return (db.prepare('SELECT book_id as bookId, tag_id as tagId FROM book_tags').all() as BookTag[])
}

export function getBookTags(bookId: string): string[] {
  const rows = db.prepare('SELECT tag_id as tagId FROM book_tags WHERE book_id = ?').all(bookId) as { tagId: string }[]
  return rows.map(r => r.tagId)
}

export function setBookTags(bookId: string, tagIds: string[]): void {
  db.transaction(() => {
    db.prepare('DELETE FROM book_tags WHERE book_id = ?').run(bookId)
    for (const tagId of tagIds) {
      db.prepare('INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)').run(bookId, tagId)
    }
  })()
}

// ---- Export / Import ----

export function exportAll() {
  return {
    books: getAllBooks(),
    series: getAllSeries(),
    reviews: getAllReviews(),
    tags: getAllTags(),
    bookTags: getAllBookTags(),
  }
}

export function importAll(data: { books?: Book[]; series?: Series[]; reviews?: Review[]; tags?: Tag[]; bookTags?: BookTag[] }): void {
  db.transaction(() => {
    if (data.series?.length) data.series.forEach(s => saveSeries(s))
    if (data.books?.length) data.books.forEach(b => saveBook(b))
    if (data.reviews?.length) data.reviews.forEach(r => saveReview(r))
    if (data.tags?.length) data.tags.forEach(t => saveTag(t))
    if (data.bookTags?.length) {
      for (const bt of data.bookTags) {
        db.prepare('INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)').run(bt.bookId, bt.tagId)
      }
    }
  })()
}
