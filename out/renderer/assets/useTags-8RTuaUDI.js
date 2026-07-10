import { u as useLibraryStore, A as storeToRefs } from "./index-vRGsP6Kw.js";
function useTags() {
  const store = useLibraryStore();
  const { tags } = storeToRefs(store);
  async function createTag(label, color) {
    const tag = { id: crypto.randomUUID(), label, color };
    await window.bookshelf.saveTag(tag);
    await store.loadTags();
    return tag;
  }
  async function updateTag(id, changes) {
    await window.bookshelf.updateTag(id, changes);
    await store.loadTags();
  }
  async function deleteTag(id) {
    await window.bookshelf.deleteTag(id);
    await Promise.all([store.loadTags(), store.loadBookTags()]);
  }
  async function addTagToBook(bookId, tagId) {
    const current = await window.bookshelf.getBookTags(bookId);
    if (!current.includes(tagId)) {
      await window.bookshelf.setBookTags(bookId, [...current, tagId]);
      await store.loadBookTags();
    }
  }
  async function removeTagFromBook(bookId, tagId) {
    const current = await window.bookshelf.getBookTags(bookId);
    await window.bookshelf.setBookTags(bookId, current.filter((id) => id !== tagId));
    await store.loadBookTags();
  }
  async function getTagsForBook(bookId) {
    const tagIds = await window.bookshelf.getBookTags(bookId);
    return store.tags.filter((t) => tagIds.includes(t.id));
  }
  async function getBooksForTag(tagId) {
    return store.bookTags.filter((bt) => bt.tagId === tagId).map((bt) => bt.bookId);
  }
  return { tags, createTag, updateTag, deleteTag, addTagToBook, removeTagFromBook, getTagsForBook, getBooksForTag };
}
export {
  useTags as u
};
