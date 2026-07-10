export type BookStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned'

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
