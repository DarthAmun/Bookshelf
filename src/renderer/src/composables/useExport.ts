import type { Book, Review } from '../types'

function triggerDownload(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatRating(rating: number | undefined): string {
  if (!rating) return '—'
  const full = Math.floor(rating / 2)
  const half = rating % 2 !== 0
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}

function formatDate(ts: number | undefined): string {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function useExport() {
  async function exportJson(): Promise<void> {
    const data = await window.bookshelf.exportJson()
    const date = new Date().toISOString().split('T')[0]
    triggerDownload(JSON.stringify(data, null, 2), `bookshelf-export-${date}.json`, 'application/json')
  }

  async function exportHtml(): Promise<void> {
    const data = await window.bookshelf.exportJson() as { books: Book[]; reviews: Review[] }
    const books = data.books.filter(b => b.status === 'read')
    const reviewMap = new Map<string, Review>(data.reviews.map(r => [r.bookId, r]))

    const cards = books.map(book => {
      const review = reviewMap.get(book.id)
      const ratingStr = formatRating(review?.rating)
      const dateReadStr = formatDate(review?.dateRead)
      const coverHtml = book.coverUrl
        ? `<img src="${book.coverUrl}" alt="${book.title}" class="cover">`
        : `<div class="cover-placeholder"></div>`

      let reviewHtml = ''
      if (review?.reviewText) {
        if (review.containsSpoilers) {
          reviewHtml = `<details><summary>⚠ Spoiler review — click to reveal</summary><p class="review-text">${review.reviewText}</p></details>`
        } else {
          reviewHtml = `<p class="review-text">${review.reviewText}</p>`
        }
      }

      return `
      <article class="book-card">
        ${coverHtml}
        <div class="book-info">
          <h2 class="book-title">${book.title}</h2>
          <p class="book-author">${book.author}</p>
          <p class="book-rating">${ratingStr}</p>
          ${dateReadStr ? `<p class="book-date">Read: ${dateReadStr}</p>` : ''}
          ${reviewHtml}
        </div>
      </article>`
    }).join('\n')

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Bookshelf</title>
<style>
  :root { --bg: #fff; --text: #111; --muted: #555; --border: #e5e7eb; --card-bg: #f9fafb; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0f172a; --text: #f1f5f9; --muted: #94a3b8; --border: #1e293b; --card-bg: #1e293b; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
  header { text-align: center; margin-bottom: 2rem; }
  header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
  header p { color: var(--muted); }
  .book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
  .book-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; gap: 1rem; }
  .cover { width: 80px; height: 120px; object-fit: cover; border-radius: 0.375rem; flex-shrink: 0; }
  .cover-placeholder { width: 80px; height: 120px; background: var(--border); border-radius: 0.375rem; flex-shrink: 0; }
  .book-info { flex: 1; min-width: 0; }
  .book-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
  .book-author { color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
  .book-rating { font-size: 1rem; color: #f59e0b; margin-bottom: 0.25rem; }
  .book-date { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.5rem; }
  .review-text { font-size: 0.875rem; line-height: 1.5; margin-top: 0.5rem; }
  details summary { cursor: pointer; font-size: 0.875rem; color: var(--muted); margin-top: 0.5rem; }
  footer { text-align: center; margin-top: 3rem; color: var(--muted); font-size: 0.875rem; }
</style>
</head>
<body>
<header>
  <h1>My Bookshelf</h1>
  <p>Exported on ${date}</p>
</header>
<main class="book-grid">
${cards}
</main>
<footer>Exported from Bookshelf</footer>
</body>
</html>`

    const exportDate = new Date().toISOString().split('T')[0]
    triggerDownload(html, `my-bookshelf-${exportDate}.html`, 'text/html')
  }

  return { exportJson, exportHtml }
}
