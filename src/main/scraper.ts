import * as cheerio from 'cheerio'
import { BrowserWindow, session } from 'electron'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

function delay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
}

function extractAsin(url: string): string | null {
  const m = url.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/)
  return m ? m[1] : null
}

function isCaptcha(html: string): boolean {
  return html.includes('Robot Check') || html.includes('CAPTCHA') || html.includes('captcha')
}

const GERMAN_MONTHS: Record<string, string> = {
  Januar: '01', Februar: '02', März: '03', April: '04', Mai: '05', Juni: '06',
  Juli: '07', August: '08', September: '09', Oktober: '10', November: '11', Dezember: '12',
}

function parseGermanDateToIso(s: string): string | undefined {
  const m = s.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/)
  if (!m) return undefined
  const month = GERMAN_MONTHS[m[2]]
  if (!month) return undefined
  return `${m[3]}-${month}-${m[1].padStart(2, '0')}`
}

export interface ScrapeBookResult {
  title?: string
  author?: string
  coverUrl?: string
  seriesName?: string
  seriesPosition?: number
  description?: string
  asin?: string
  publishedDate?: string
  error?: string
}

export interface ScrapeSeriesBook {
  title: string
  asin: string
  coverUrl?: string
  seriesPosition?: number
  releaseDate?: string
}

export interface ScrapeSeriesResult {
  seriesName?: string
  author?: string
  books: ScrapeSeriesBook[]
  totalBooks?: number
  error?: string
}

export async function scrapeAmazonBook(url: string): Promise<ScrapeBookResult> {
  await delay()
  try {
    const cookieList = await session.defaultSession.cookies.get({ domain: '.amazon.de' })
    const cookieHeader = cookieList.map(c => `${c.name}=${c.value}`).join('; ')
    const res = await fetch(url, {
      headers: { ...HEADERS, ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    })
    if (!res.ok) return { error: `HTTP ${res.status}` }
    const html = await res.text()
    if (isCaptcha(html)) return { error: 'Amazon returned a CAPTCHA page. Try again later.' }

    const $ = cheerio.load(html)

    const title = $('#productTitle').text().trim()
    if (!title) return { error: 'Could not extract book title. The page structure may have changed.' }

    const author =
      $('.author .contributorNameID').first().text().trim() ||
      $('a.contributorNameID').first().text().trim() ||
      $('.author a').first().text().trim() ||
      undefined

    // Cover — Amazon stores multiple sizes as JSON in data-a-dynamic-image
    let coverUrl: string | undefined
    const imgDataAttr =
      $('#imgBlurImage').attr('data-a-dynamic-image') ||
      $('#ebooksImgBlurImage').attr('data-a-dynamic-image') ||
      $('#img-canvas img').attr('data-a-dynamic-image')
    if (imgDataAttr) {
      try {
        const imgMap: Record<string, [number, number]> = JSON.parse(imgDataAttr)
        const urls = Object.keys(imgMap)
        coverUrl = urls.sort((a, b) => {
          const [wa, ha] = imgMap[a] ?? [0, 0]
          const [wb, hb] = imgMap[b] ?? [0, 0]
          return wb * hb - wa * ha
        })[0]
      } catch {
        // fall through to selector fallbacks
      }
    }
    if (!coverUrl) {
      coverUrl =
        $('#landingImage').attr('src') ||
        $('#img-canvas img').first().attr('src') ||
        $('#main-image').attr('src') ||
        undefined
    }

    // Series info from the bullet under the title
    let seriesName: string | undefined
    let seriesPosition: number | undefined
    const seriesBulletText = $('#seriesBullet_feature_div').text().trim()
    if (seriesBulletText) {
      const posMatch = seriesBulletText.match(/Book\s+(\d+)/i)
      if (posMatch) seriesPosition = parseInt(posMatch[1])
      const nameMatch = seriesBulletText.match(/:\s*(.+)$/) || seriesBulletText.match(/\(([^)]+)\)/)
      if (nameMatch) seriesName = nameMatch[1].trim()
    }

    // Description
    const description =
      $('#bookDescription_feature_div .a-expander-content').text().trim() ||
      $('#productDescription p').first().text().trim() ||
      undefined

    const asin = extractAsin(url) || undefined

    // Published date from detail bullets
    const detailText = $('#detailBullets_feature_div').text() + $('#detailBulletsWrapper_feature_div').text()
    const dateMatch = detailText.match(/(\d{1,2}\.\s*\w+\s*\d{4})/)
    const publishedDate = dateMatch ? dateMatch[1] : undefined

    return { title, author, coverUrl, seriesName, seriesPosition, description, asin, publishedDate }
  } catch (e) {
    return { error: String(e) }
  }
}

async function loadSeriesPageWithJs(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      show: false,
      skipTaskbar: true,
      webPreferences: {
        contextIsolation: true,
        allowRunningInsecureContent: true,
      },
    })

    const hardTimeout = setTimeout(() => {
      win.destroy()
      reject(new Error('Series page load timed out'))
    }, 45000)

    win.webContents.setUserAgent(USER_AGENT)
    win.loadURL(url, { userAgent: USER_AGENT })
      .then(async () => {
        // Scroll through the page to trigger any IntersectionObserver-gated lazy loading
        await win.webContents.executeJavaScript(`
          new Promise(resolve => {
            const total = document.body.scrollHeight
            let y = 0
            const id = setInterval(() => {
              window.scrollTo(0, y)
              y += 500
              if (y >= total) { clearInterval(id); window.scrollTo(0, 0); resolve(undefined) }
            }, 60)
          })
        `)

        await new Promise(r => setTimeout(r, 2000))

        const html: string = await win.webContents.executeJavaScript('document.documentElement.outerHTML')
        clearTimeout(hardTimeout)
        win.destroy()
        resolve(html)
      })
      .catch(e => {
        clearTimeout(hardTimeout)
        win.destroy()
        reject(e)
      })
  })
}

export async function scrapeAmazonSeries(url: string): Promise<ScrapeSeriesResult> {
  await delay()
  try {
    let html: string
    try {
      html = await loadSeriesPageWithJs(url)
    } catch (e) {
      return { books: [], error: `Failed to load page: ${String(e)}` }
    }
    if (isCaptcha(html)) return { books: [], error: 'Amazon returned a CAPTCHA page. Try again later.' }

    const $ = cheerio.load(html)

    const seriesName =
      $('span#title').first().text().trim() ||
      $('#collection-title').text().trim() ||
      $('h1.a-size-large').first().text().trim() ||
      undefined

    const bdsLabel = $('bds-link[label*="(Autor)"], bds-link[label*="(Author)"]').first().attr('label')
    const author = (
      bdsLabel?.replace(/\s*\([^)]+\)\s*$/, '').trim() ||
      $('.author .contributorNameID').first().text().trim() ||
      $('a.contributorNameID').first().text().trim()
    ) || undefined

    const books: ScrapeSeriesBook[] = []

    const itemEls = $('.series-childAsin-item').toArray()

    itemEls.forEach((el, idx) => {
      const $el = $(el)
      const asin =
        $el.attr('data-asin') ||
        extractAsin($el.find('a').first().attr('href') ?? '')
      if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return

      const title = $el.find('.itemBookTitle h3').first().text().trim() || $el.find('h2, h3').first().text().trim()
      if (!title) return

      const coverUrl = $el.find('img.asinImage').first().attr('src') || $el.find('img').first().attr('src') || undefined

      const posLabelText = $el.find('.itemPositionLabel').text().trim()
      const posFromLabel = posLabelText ? parseInt(posLabelText) : NaN
      const seriesPosition = !isNaN(posFromLabel) ? posFromLabel : idx + 1

      const $grid = $el.closest('.a-fixed-right-grid')
      const $scope = $grid.length ? $grid : $el

      const rawDate = $scope.find('.a-color-success.a-text-bold').first().text().trim()
      const releaseDate = rawDate ? (parseGermanDateToIso(rawDate) ?? rawDate) : undefined

      books.push({ title, asin, coverUrl, seriesPosition, releaseDate })
    })

    // Fallback: search results layout (some series pages render as search)
    if (!books.length) {
      $('[data-asin]').each((_, el) => {
        const $el = $(el)
        const asin = $el.attr('data-asin')
        if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return
        const title =
          $el.find('h2 span.a-text-normal, h2 a span').first().text().trim() ||
          $el.find('.a-size-medium.a-color-base.a-text-normal').first().text().trim()
        if (!title) return
        const coverUrl = $el.find('img').first().attr('src') || undefined
        books.push({ title, asin, coverUrl })
      })
    }

    return { seriesName, author, books, totalBooks: books.length }
  } catch (e) {
    return { books: [], error: String(e) }
  }
}
