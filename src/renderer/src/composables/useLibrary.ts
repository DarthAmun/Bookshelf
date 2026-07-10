import { storeToRefs } from 'pinia'
import { useLibraryStore } from '../stores/library'

export function useLibrary() {
  const store = useLibraryStore()
  store.init()
  const { books, reviews } = storeToRefs(store)
  return { books, reviews }
}
