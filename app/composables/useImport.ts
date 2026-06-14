import { db } from './useDb'

export function useImport() {
  async function importJson(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      await db.transaction('rw', db.books, db.series, db.reviews, db.tags, db.bookTags, async () => {
        if (Array.isArray(data.books) && data.books.length) await db.books.bulkPut(data.books)
        if (Array.isArray(data.series) && data.series.length) await db.series.bulkPut(data.series)
        if (Array.isArray(data.reviews) && data.reviews.length) await db.reviews.bulkPut(data.reviews)
        if (Array.isArray(data.tags) && data.tags.length) await db.tags.bulkPut(data.tags)
        if (Array.isArray(data.bookTags) && data.bookTags.length) await db.bookTags.bulkPut(data.bookTags)
      })

      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  return { importJson }
}
