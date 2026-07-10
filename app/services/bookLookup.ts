import type { Book } from '../composables/useDb'

export interface BookMeta extends Partial<Book> {
  seriesNameHint?: string
  seriesPosHint?: number
}

export function extractAsin(url: string): string | null {
  const match = url.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/)
  return match ? match[1] : null
}

export function extractUrlSlug(url: string): string | null {
  // Captures the human-readable slug before /dp/ or /gp/product/ — returns null for bare /dp/ASIN links
  const match = url.match(/amazon\.[^/]+\/([^/]+)\/(?:dp|gp\/product)\//)
  if (!match) return null
  const slug = match[1]
  // Discard if we accidentally captured a path segment instead of a real title slug
  if (/^(dp|gp|product|s|b)$/.test(slug)) return null
  return slug
}

export type LookupResult =
  | { status: 'found'; book: BookMeta }
  | { status: 'needs_search'; asin: string; suggestedQuery: string }
  | { status: 'error' }

interface GoogleVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    language?: string
    imageLinks?: { thumbnail?: string; smallThumbnail?: string }
    industryIdentifiers?: Array<{ type: string; identifier: string }>
  }
}

function extractSeriesFromTitle(rawTitle: string): { cleanTitle: string; seriesName: string; seriesPosition?: number } | null {
  const m = rawTitle.match(/^(.+?)\s*\(([^)]+?),\s*(?:#|[Bb]ook\s*|[Pp]art\s*|[Vv]ol(?:ume)?\s*)(\d+)[^)]*\)/)
  if (!m) return null
  return { cleanTitle: m[1].trim(), seriesName: m[2].trim(), seriesPosition: parseInt(m[3]) }
}

function mapVolumeToBook(volume: GoogleVolume, asin?: string): BookMeta {
  const info = volume.volumeInfo
  const isbn10 = info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier
  const isbn13 = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
  const rawTitle = info.title ?? ''
  const seriesInfo = extractSeriesFromTitle(rawTitle)
  return {
    googleBooksId: volume.id,
    title: seriesInfo ? seriesInfo.cleanTitle : rawTitle,
    author: info.authors?.[0] ?? 'Unknown',
    asin,
    isbn: isbn10 ?? isbn13,
    coverUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://')
      ?? info.imageLinks?.smallThumbnail?.replace('http://', 'https://'),
    publisher: info.publisher,
    publishedDate: info.publishedDate,
    description: info.description,
    pageCount: info.pageCount,
    language: info.language,
    genre: info.categories?.[0],
    seriesNameHint: seriesInfo?.seriesName,
    seriesPosHint: seriesInfo?.seriesPosition,
  }
}

// Step 1: Open Library ASIN lookup — fast, works for print books and some Kindle titles
async function openLibraryLookup(asin: string): Promise<Partial<Book> | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=AMAZON:${asin}&format=json&jscmd=data`,
    )
    if (!res.ok) return null
    const data = await res.json()
    const entry = data[`AMAZON:${asin}`]
    if (!entry?.title) return null
    const isbn10 = entry.identifiers?.isbn_10?.[0]
    const isbn13 = entry.identifiers?.isbn_13?.[0]
    return {
      title: entry.title,
      author: entry.authors?.[0]?.name ?? 'Unknown',
      asin,
      isbn: isbn10 ?? isbn13,
      coverUrl: entry.cover?.medium ?? entry.cover?.small,
      publisher: entry.publishers?.[0]?.name,
      publishedDate: entry.publish_date,
    }
  } catch {
    return null
  }
}

async function fetchGoogleVolumes(query: string, apiKey?: string, maxResults = 5): Promise<GoogleVolume[]> {
  const keyParam = apiKey ? `&key=${apiKey}` : ''
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&maxResults=${maxResults}${keyParam}`,
    )
    if (!res.ok) return []
    return ((await res.json()).items ?? []) as GoogleVolume[]
  } catch {
    return []
  }
}

// Step 2: Google Books search — returns up to 5 results for the user to pick from
export async function searchGoogleBooks(query: string, apiKey?: string): Promise<BookMeta[]> {
  const cleanedQuery = query.replace(/\bprintType:\S+/g, '').trim()
  const volumes = await fetchGoogleVolumes(cleanedQuery, apiKey)
  return volumes.map(v => mapVolumeToBook(v))
}

export async function lookupByAsin(asin: string, urlSlug?: string): Promise<LookupResult> {
  try {
    const book = await openLibraryLookup(asin)
    if (book) return { status: 'found', book }

    const suggestedQuery = urlSlug
      ? urlSlug.replace(/-/g, ' ').replace(/\b(ebook|kindle|edition|book)\b/gi, '').trim()
      : ''
    return { status: 'needs_search', asin, suggestedQuery }
  } catch {
    return { status: 'error' }
  }
}

export function openLibraryCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`
}

// Fetch up to 40 books for a given series name + author, sorted by series position.
// Books without a detected position are appended at the end.
export async function searchSeriesBooks(seriesName: string, author: string, apiKey?: string): Promise<BookMeta[]> {
  const query = `inauthor:"${author}" "${seriesName}"`
  const volumes = await fetchGoogleVolumes(query, apiKey, 40)
  const books = volumes.map(v => mapVolumeToBook(v))
  const lowerSeries = seriesName.toLowerCase()
  const authorWords = author.toLowerCase().split(/\s+/)
  return books
    .filter((b) => {
      const lowerAuthor = b.author?.toLowerCase()
      const authorMatch = authorWords.some(w => w.length > 2 && lowerAuthor?.includes(w))
      const hintMatch = b.seriesNameHint?.toLowerCase().includes(lowerSeries)
      const titleMatch = b.title?.toLowerCase().includes(lowerSeries)
      return authorMatch || hintMatch || titleMatch
    })
    .sort((a, b) => (a.seriesPosHint ?? 9999) - (b.seriesPosHint ?? 9999))
}
