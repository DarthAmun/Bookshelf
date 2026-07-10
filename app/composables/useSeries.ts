import { db, type Series, type Book } from './useDb'
import { useLiveQuery } from './useLiveQuery'

export async function addSeries(data: Omit<Series, 'id'>): Promise<Series> {
  const series: Series = { ...data, id: crypto.randomUUID() }
  await db.series.add(series)
  return series
}

export async function findSeriesByName(name: string): Promise<Series | undefined> {
  return db.series.where('name').equalsIgnoreCase(name).first()
}

export function useSeries() {
  const seriesList = useLiveQuery(() => db.series.orderBy('name').toArray(), [])

  async function updateSeries(id: string, changes: Partial<Series>) {
    await db.series.update(id, changes)
  }

  async function deleteSeries(id: string) {
    await db.transaction('rw', db.series, db.books, async () => {
      await db.series.delete(id)
      await db.books.where('seriesId').equals(id).modify({ seriesId: undefined, seriesPosition: undefined })
    })
  }

  async function getSeriesById(id: string): Promise<Series | undefined> {
    return db.series.get(id)
  }

  async function getSeriesProgress(seriesId: string): Promise<{ read: number; total: number; books: Book[] }> {
    const [books, series] = await Promise.all([
      db.books.where('seriesId').equals(seriesId).toArray(),
      db.series.get(seriesId),
    ])
    const read = books.filter(b => b.status === 'read').length
    const total = series?.knownTotal ?? books.length
    return { read, total, books }
  }

  return { seriesList, addSeries, updateSeries, deleteSeries, getSeriesById, getSeriesProgress }
}
