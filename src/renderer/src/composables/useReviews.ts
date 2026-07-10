import type { Review } from '../types'

export function useReviews() {
  async function addReview(data: Omit<Review, 'id' | 'updatedAt'>): Promise<string> {
    const existing = await window.bookshelf.getReview(data.bookId)
    if (existing) {
      const updated: Review = { ...existing, ...data, updatedAt: Date.now() }
      await window.bookshelf.saveReview(updated)
      return existing.id
    }
    const review: Review = { ...data, id: crypto.randomUUID(), updatedAt: Date.now() }
    await window.bookshelf.saveReview(review)
    return review.id
  }

  async function updateReview(id: string, changes: Partial<Review>): Promise<void> {
    const review = await window.bookshelf.getReview(changes.bookId ?? id)
    if (!review) return
    await window.bookshelf.saveReview({ ...review, ...changes, updatedAt: Date.now() })
  }

  async function getReviewForBook(bookId: string): Promise<Review | undefined> {
    return window.bookshelf.getReview(bookId)
  }

  return { addReview, updateReview, getReviewForBook }
}
