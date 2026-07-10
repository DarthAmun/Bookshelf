import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useLibraryStore } from '../stores/library'
import type { Series } from '../types'

export async function addSeries(data: Omit<Series, 'id'>): Promise<Series> {
  const series: Series = { ...data, id: crypto.randomUUID() }
  await window.bookshelf.saveSeries(series)
  await useLibraryStore().loadSeries()
  return series
}

export async function findSeriesByName(name: string): Promise<Series | undefined> {
  const store = useLibraryStore()
  return store.series.find(s => s.name.toLowerCase() === name.toLowerCase())
}

export function useSeries() {
  const store = useLibraryStore()
  const { series: seriesList, books } = storeToRefs(store)

  async function updateSeries(id: string, changes: Partial<Series>): Promise<void> {
    await window.bookshelf.updateSeries(id, changes)
    await store.loadSeries()
  }

  async function deleteSeries(id: string): Promise<void> {
    await window.bookshelf.deleteSeries(id)
    await store.refresh()
  }

  async function getSeriesById(id: string): Promise<Series | undefined> {
    return store.series.find(s => s.id === id)
  }

  async function getSeriesProgress(seriesId: string): Promise<{ read: number; total: number; books: import('../types').Book[] }> {
    const seriesBooks = store.books.filter(b => b.seriesId === seriesId)
    const read = seriesBooks.filter(b => b.status === 'read').length
    const s = store.series.find(s => s.id === seriesId)
    const total = s?.knownTotal ?? seriesBooks.length
    return { read, total, books: seriesBooks }
  }

  return { seriesList, addSeries, updateSeries, deleteSeries, getSeriesById, getSeriesProgress }
}
