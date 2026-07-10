import { contextBridge, ipcRenderer } from 'electron'
import type { Book, Series, Review, Tag } from '../main/db'

export type { Book, Series, Review, Tag }

export interface BookshelfAPI {
  scrapeBook: (url: string) => Promise<import('../main/scraper').ScrapeBookResult>
  scrapeSeries: (url: string) => Promise<import('../main/scraper').ScrapeSeriesResult>

  getBooks: () => Promise<Book[]>
  getBook: (id: string) => Promise<Book | undefined>
  saveBook: (book: Book) => Promise<void>
  updateBook: (id: string, data: Partial<Book>) => Promise<void>
  deleteBook: (id: string) => Promise<void>

  getSeries: () => Promise<Series[]>
  saveSeries: (series: Series) => Promise<void>
  updateSeries: (id: string, data: Partial<Series>) => Promise<void>
  deleteSeries: (id: string) => Promise<void>

  getAllReviews: () => Promise<Review[]>
  getReview: (bookId: string) => Promise<Review | undefined>
  saveReview: (review: Review) => Promise<void>

  getTags: () => Promise<Tag[]>
  saveTag: (tag: Tag) => Promise<void>
  updateTag: (id: string, data: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  getAllBookTags: () => Promise<Array<{ bookId: string; tagId: string }>>
  getBookTags: (bookId: string) => Promise<string[]>
  setBookTags: (bookId: string, tagIds: string[]) => Promise<void>

  checkAllSeries: () => Promise<boolean>

  exportJson: () => Promise<object>
  importJson: (jsonStr: string) => Promise<void>

}

const api: BookshelfAPI = {
  scrapeBook: (url) => ipcRenderer.invoke('scrape:book', url),
  scrapeSeries: (url) => ipcRenderer.invoke('scrape:series', url),

  getBooks: () => ipcRenderer.invoke('db:books:getAll'),
  getBook: (id) => ipcRenderer.invoke('db:books:get', id),
  saveBook: (book) => ipcRenderer.invoke('db:books:save', book),
  updateBook: (id, data) => ipcRenderer.invoke('db:books:update', id, data),
  deleteBook: (id) => ipcRenderer.invoke('db:books:delete', id),

  getSeries: () => ipcRenderer.invoke('db:series:getAll'),
  saveSeries: (series) => ipcRenderer.invoke('db:series:save', series),
  updateSeries: (id, data) => ipcRenderer.invoke('db:series:update', id, data),
  deleteSeries: (id) => ipcRenderer.invoke('db:series:delete', id),

  getAllReviews: () => ipcRenderer.invoke('db:reviews:getAll'),
  getReview: (bookId) => ipcRenderer.invoke('db:reviews:get', bookId),
  saveReview: (review) => ipcRenderer.invoke('db:reviews:save', review),

  getTags: () => ipcRenderer.invoke('db:tags:getAll'),
  saveTag: (tag) => ipcRenderer.invoke('db:tags:save', tag),
  updateTag: (id, data) => ipcRenderer.invoke('db:tags:update', id, data),
  deleteTag: (id) => ipcRenderer.invoke('db:tags:delete', id),

  getAllBookTags: () => ipcRenderer.invoke('db:bookTags:getAll'),
  getBookTags: (bookId) => ipcRenderer.invoke('db:bookTags:get', bookId),
  setBookTags: (bookId, tagIds) => ipcRenderer.invoke('db:bookTags:set', bookId, tagIds),

  checkAllSeries: () => ipcRenderer.invoke('series:checkAll'),

  exportJson: () => ipcRenderer.invoke('export:json'),
  importJson: (jsonStr) => ipcRenderer.invoke('import:json', jsonStr),

}

contextBridge.exposeInMainWorld('bookshelf', api)
