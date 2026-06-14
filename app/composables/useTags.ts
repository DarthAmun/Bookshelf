import { db, type Tag, type BookTag } from './useDb'
import { useLiveQuery } from './useLiveQuery'

export function useTags() {
  const tags = useLiveQuery(() => db.tags.orderBy('label').toArray(), [])

  async function createTag(label: string, color: string): Promise<Tag> {
    const tag: Tag = { id: crypto.randomUUID(), label, color }
    await db.tags.add(tag)
    return tag
  }

  async function updateTag(id: string, changes: Partial<Tag>) {
    await db.tags.update(id, changes)
  }

  async function deleteTag(id: string) {
    await db.transaction('rw', db.tags, db.bookTags, async () => {
      await db.tags.delete(id)
      await db.bookTags.where('tagId').equals(id).delete()
    })
  }

  async function addTagToBook(bookId: string, tagId: string) {
    await db.bookTags.put({ bookId, tagId })
  }

  async function removeTagFromBook(bookId: string, tagId: string) {
    await db.bookTags.delete([bookId, tagId])
  }

  async function getTagsForBook(bookId: string): Promise<Tag[]> {
    const bookTags = await db.bookTags.where('bookId').equals(bookId).toArray()
    const tagIds = bookTags.map(bt => bt.tagId)
    return db.tags.where('id').anyOf(tagIds).toArray()
  }

  async function getBooksForTag(tagId: string): Promise<string[]> {
    const bookTags = await db.bookTags.where('tagId').equals(tagId).toArray()
    return bookTags.map(bt => bt.bookId)
  }

  return { tags, createTag, updateTag, deleteTag, addTagToBook, removeTagFromBook, getTagsForBook, getBooksForTag }
}
