import { ref } from 'vue'
import { liveQuery } from 'dexie'
import { db } from './useDb'
import type { Book, Review } from './useDb'

const books = ref<Book[]>([])
const reviews = ref<Review[]>([])
let initialized = false

function init() {
  if (initialized) return
  initialized = true
  liveQuery(() => db.books.toArray()).subscribe({
    next: val => { books.value = val },
    error: e => console.error(e),
  })
  liveQuery(() => db.reviews.toArray()).subscribe({
    next: val => { reviews.value = val },
    error: e => console.error(e),
  })
}

export function useLibrary() {
  init()
  return { books, reviews }
}
