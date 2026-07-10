import { storeToRefs } from 'pinia'
import { useLibraryStore } from '../stores/library'
import type { Tag } from '../types'

export function useTags() {
  const store = useLibraryStore()
  const { tags } = storeToRefs(store)

  async function createTag(label: string, color: string): Promise<Tag> {
    const tag: Tag = { id: crypto.randomUUID(), label, color }
    await window.bookshelf.saveTag(tag)
    await store.loadTags()
    return tag
  }

  async function updateTag(id: string, changes: Partial<Tag>): Promise<void> {
    await window.bookshelf.updateTag(id, changes)
    await store.loadTags()
  }

  async function deleteTag(id: string): Promise<void> {
    await window.bookshelf.deleteTag(id)
    await Promise.all([store.loadTags(), store.loadBookTags()])
  }

  async function addTagToBook(bookId: string, tagId: string): Promise<void> {
    const current = await window.bookshelf.getBookTags(bookId)
    if (!current.includes(tagId)) {
      await window.bookshelf.setBookTags(bookId, [...current, tagId])
      await store.loadBookTags()
    }
  }

  async function removeTagFromBook(bookId: string, tagId: string): Promise<void> {
    const current = await window.bookshelf.getBookTags(bookId)
    await window.bookshelf.setBookTags(bookId, current.filter(id => id !== tagId))
    await store.loadBookTags()
  }

  async function getTagsForBook(bookId: string): Promise<Tag[]> {
    const tagIds = await window.bookshelf.getBookTags(bookId)
    return store.tags.filter(t => tagIds.includes(t.id))
  }

  async function getBooksForTag(tagId: string): Promise<string[]> {
    return store.bookTags.filter(bt => bt.tagId === tagId).map(bt => bt.bookId)
  }

  return { tags, createTag, updateTag, deleteTag, addTagToBook, removeTagFromBook, getTagsForBook, getBooksForTag }
}
