import { db, type Series } from '../composables/useDb'

interface GoogleVolume {
  id: string
  volumeInfo: {
    title: string
    publishedDate?: string
  }
}

export async function checkSeriesForNewBooks(series: Series, apiKey?: string): Promise<{ newTitle?: string; newDate?: string; hasNew: boolean }> {
  if (!series.googleBooksQueryName) return { hasNew: false }

  const query = `intitle:"${series.googleBooksQueryName}" inauthor:"${series.author}"`
  const keyParam = apiKey ? `&key=${apiKey}` : ''
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&showPreorders=true&orderBy=newest&maxResults=10${keyParam}`

  try {
    const res = await fetch(url)
    if (!res.ok) return { hasNew: false }
    const data = await res.json()
    const volumes: GoogleVolume[] = data.items ?? []

    const newest = volumes[0]
    if (!newest) {
      await db.series.update(series.id, { lastChecked: Date.now() })
      return { hasNew: false }
    }

    const newDate = newest.volumeInfo.publishedDate
    const newTitle = newest.volumeInfo.title
    const knownTotal = series.knownTotal ?? 0
    const hasNew = (data.totalItems ?? 0) > knownTotal

    await db.series.update(series.id, {
      lastChecked: Date.now(),
      newReleaseAvailable: hasNew,
      nextBookTitle: hasNew ? newTitle : series.nextBookTitle,
      nextBookDate: hasNew ? newDate : series.nextBookDate,
      knownTotal: Math.max(knownTotal, data.totalItems ?? 0),
    })

    return { hasNew, newTitle: hasNew ? newTitle : undefined, newDate: hasNew ? newDate : undefined }
  } catch {
    return { hasNew: false }
  }
}

export async function checkAllSeries(apiKey?: string): Promise<void> {
  const allSeries = await db.series.toArray()
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const stale = allSeries.filter(s => !s.lastChecked || s.lastChecked < cutoff)

  for (const series of stale) {
    await checkSeriesForNewBooks(series, apiKey)
    await new Promise(r => setTimeout(r, 500))
  }
}
