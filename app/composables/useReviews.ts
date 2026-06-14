import { db, type Review } from './useDb'

export function useReviews() {
  async function addReview(data: Omit<Review, 'id' | 'updatedAt'>) {
    const existing = await db.reviews.where('bookId').equals(data.bookId).first()
    if (existing) {
      await db.reviews.update(existing.id, { ...data, updatedAt: Date.now() })
      return existing.id
    }
    const review: Review = { ...data, id: crypto.randomUUID(), updatedAt: Date.now() }
    await db.reviews.add(review)
    return review.id
  }

  async function updateReview(id: string, changes: Partial<Review>) {
    await db.reviews.update(id, { ...changes, updatedAt: Date.now() })
  }

  async function getReviewForBook(bookId: string): Promise<Review | undefined> {
    return db.reviews.where('bookId').equals(bookId).first()
  }

  async function getAllReviews(): Promise<Review[]> {
    return db.reviews.toArray()
  }

  return { addReview, updateReview, getReviewForBook, getAllReviews }
}
