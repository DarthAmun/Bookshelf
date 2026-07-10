import { useLibraryStore } from '../stores/library'

export function useImport() {
  async function importJson(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const text = await file.text()
      JSON.parse(text) // validate JSON before sending
      await window.bookshelf.importJson(text)
      await useLibraryStore().refresh()
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  return { importJson }
}
