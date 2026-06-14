import type { Book } from '../composables/useDb'

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
  | { status: 'found'; book: Partial<Book> }
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

function mapVolumeToBook(volume: GoogleVolume, asin?: string): Partial<Book> {
  const info = volume.volumeInfo
  const isbn10 = info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier
  const isbn13 = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
  return {
    googleBooksId: volume.id,
    title: info.title,
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

// Step 2: Google Books search — returns up to 5 results for the user to pick from
export async function searchGoogleBooks(query: string, apiKey?: string): Promise<Partial<Book>[]> {
  const cleanedQuery = query.replace(/\bprintType:\S+/g, '').trim()
  const keyParam = apiKey ? `&key=${apiKey}` : ''
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanedQuery)}&printType=books&maxResults=5${keyParam}`,
    )
    if (!res.ok) return []
    const data = await res.json()
    const volumes: GoogleVolume[] = data.items ?? []
    return volumes.map(v => mapVolumeToBook(v))
  } catch {
    return []
  }
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
