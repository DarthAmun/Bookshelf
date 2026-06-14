import { db, type Book } from './useDb'
import { useLiveQuery } from './useLiveQuery'

export async function addBook(data: Omit<Book, 'id' | 'dateAdded'>): Promise<Book> {
  const book: Book = { ...data, id: crypto.randomUUID(), dateAdded: Date.now() }
  await db.books.add(book)
  return book
}

export function useBooks() {
  const books = useLiveQuery(() => db.books.orderBy('dateAdded').reverse().toArray(), [])

  async function updateBook(id: string, changes: Partial<Book>) {
    await db.books.update(id, changes)
  }

  async function deleteBook(id: string) {
    await db.transaction('rw', db.books, db.reviews, db.bookTags, async () => {
      await db.books.delete(id)
      await db.reviews.where('bookId').equals(id).delete()
      await db.bookTags.where('bookId').equals(id).delete()
    })
  }

  async function getBook(id: string): Promise<Book | undefined> {
    return db.books.get(id)
  }

  return { books, addBook, updateBook, deleteBook, getBook }
}
