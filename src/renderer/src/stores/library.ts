import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, Series, Review, Tag, BookTag } from '../types'

export const useLibraryStore = defineStore('library', () => {
  const books = ref<Book[]>([])
  const reviews = ref<Review[]>([])
  const series = ref<Series[]>([])
  const tags = ref<Tag[]>([])
  const bookTags = ref<BookTag[]>([])
  let initialized = false

  async function init(): Promise<void> {
    if (initialized) return
    initialized = true
    await refresh()
  }

  async function refresh(): Promise<void> {
    const [b, r, s, t, bt] = await Promise.all([
      window.bookshelf.getBooks(),
      window.bookshelf.getAllReviews(),
      window.bookshelf.getSeries(),
      window.bookshelf.getTags(),
      window.bookshelf.getAllBookTags(),
    ])
    books.value = b
    reviews.value = r
    series.value = s
    tags.value = t
    bookTags.value = bt as BookTag[]
  }

  async function loadBooks(): Promise<void> {
    books.value = await window.bookshelf.getBooks()
  }

  async function loadSeries(): Promise<void> {
    series.value = await window.bookshelf.getSeries()
  }

  async function loadTags(): Promise<void> {
    tags.value = await window.bookshelf.getTags()
  }

  async function loadBookTags(): Promise<void> {
    bookTags.value = (await window.bookshelf.getAllBookTags()) as BookTag[]
  }

  return {
    books,
    reviews,
    series,
    tags,
    bookTags,
    init,
    refresh,
    loadBooks,
    loadSeries,
    loadTags,
    loadBookTags,
  }
})
