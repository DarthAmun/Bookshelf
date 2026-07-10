import { storeToRefs } from 'pinia'
import { useLibraryStore } from '../stores/library'
import type { Book } from '../types'

export async function addBook(data: Omit<Book, 'id' | 'dateAdded'>): Promise<Book> {
  const book: Book = { ...data, id: crypto.randomUUID(), dateAdded: Date.now() }
  await window.bookshelf.saveBook(book)
  await useLibraryStore().loadBooks()
  return book
}

export function useBooks() {
  const store = useLibraryStore()
  const { books } = storeToRefs(store)

  async function updateBook(id: string, changes: Partial<Book>): Promise<void> {
    await window.bookshelf.updateBook(id, changes)
    await store.loadBooks()
  }

  async function deleteBook(id: string): Promise<void> {
    await window.bookshelf.deleteBook(id)
    await store.refresh()
  }

  async function getBook(id: string): Promise<Book | undefined> {
    return window.bookshelf.getBook(id)
  }

  return { books, addBook, updateBook, deleteBook, getBook }
}
