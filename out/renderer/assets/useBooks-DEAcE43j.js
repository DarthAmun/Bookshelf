import { u as useLibraryStore, A as storeToRefs } from "./index-vRGsP6Kw.js";
async function addBook(data) {
  const book = { ...data, id: crypto.randomUUID(), dateAdded: Date.now() };
  await window.bookshelf.saveBook(book);
  await useLibraryStore().loadBooks();
  return book;
}
function useBooks() {
  const store = useLibraryStore();
  const { books } = storeToRefs(store);
  async function updateBook(id, changes) {
    await window.bookshelf.updateBook(id, changes);
    await store.loadBooks();
  }
  async function deleteBook(id) {
    await window.bookshelf.deleteBook(id);
    await store.refresh();
  }
  async function getBook(id) {
    return window.bookshelf.getBook(id);
  }
  return { books, addBook, updateBook, deleteBook, getBook };
}
export {
  addBook as a,
  useBooks as u
};
