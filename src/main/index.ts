import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as cron from 'node-cron'
import * as db from './db'
import * as scraper from './scraper'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.personal.bookshelf')
  app.on('browser-window-created', (_, win) => optimizer.watchWindowShortcuts(win))

  db.initDb()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Weekly Monday 10am series check
  cron.schedule('0 10 * * 1', () => { checkAllSeries() })

  // On startup: check if any series is stale (>7 days)
  checkSeriesIfStale()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

async function checkSeriesIfStale(): Promise<void> {
  const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000
  const stale = db.getAllSeries().filter(
    s => s.amazonUrl && (!s.lastChecked || s.lastChecked < staleThreshold)
  )
  if (stale.length) await checkAllSeries(stale)
}

async function checkAllSeries(seriesOverride?: db.Series[]): Promise<boolean> {
  const allSeries = seriesOverride ?? db.getAllSeries()
  const allBooks = db.getAllBooks()
  let anyNew = false

  for (const series of allSeries) {
    if (!series.amazonUrl) continue
    const result = await scraper.scrapeAmazonSeries(series.amazonUrl)
    if (result.error || !result.books.length) continue

    const seriesBookAsins = new Set(
      allBooks.filter(b => b.seriesId === series.id).map(b => b.asin).filter(Boolean)
    )
    const newBooks = result.books.filter(b => b.asin && !seriesBookAsins.has(b.asin))

    const hasNew = newBooks.length > 0
    if (hasNew) anyNew = true

    const nextBook = newBooks.sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))[0]

    db.updateSeries(series.id, {
      lastChecked: Date.now(),
      newReleaseAvailable: hasNew || series.newReleaseAvailable,
      nextBookTitle: nextBook?.title ?? series.nextBookTitle,
      nextBookDate: nextBook?.releaseDate ?? series.nextBookDate,
      knownTotal: result.totalBooks ?? series.knownTotal,
    })
  }

  if (anyNew) {
    new Notification({
      title: 'Bookshelf',
      body: 'New entries found in your tracked series!',
    }).show()
  }

  return anyNew
}

function registerIpcHandlers(): void {
  // Scraping
  ipcMain.handle('scrape:book', (_, url: string) => scraper.scrapeAmazonBook(url))
  ipcMain.handle('scrape:series', (_, url: string) => scraper.scrapeAmazonSeries(url))

  // Books
  ipcMain.handle('db:books:getAll', () => db.getAllBooks())
  ipcMain.handle('db:books:get', (_, id: string) => db.getBook(id))
  ipcMain.handle('db:books:save', (_, book: db.Book) => db.saveBook(book))
  ipcMain.handle('db:books:update', (_, id: string, data: Partial<db.Book>) => db.updateBook(id, data))
  ipcMain.handle('db:books:delete', (_, id: string) => db.deleteBook(id))

  // Series
  ipcMain.handle('db:series:getAll', () => db.getAllSeries())
  ipcMain.handle('db:series:save', (_, series: db.Series) => db.saveSeries(series))
  ipcMain.handle('db:series:update', (_, id: string, data: Partial<db.Series>) => db.updateSeries(id, data))
  ipcMain.handle('db:series:delete', (_, id: string) => db.deleteSeries(id))

  // Reviews
  ipcMain.handle('db:reviews:getAll', () => db.getAllReviews())
  ipcMain.handle('db:reviews:get', (_, bookId: string) => db.getReview(bookId))
  ipcMain.handle('db:reviews:save', (_, review: db.Review) => db.saveReview(review))

  // Tags
  ipcMain.handle('db:tags:getAll', () => db.getAllTags())
  ipcMain.handle('db:tags:save', (_, tag: db.Tag) => db.saveTag(tag))
  ipcMain.handle('db:tags:update', (_, id: string, data: Partial<db.Tag>) => db.updateTag(id, data))
  ipcMain.handle('db:tags:delete', (_, id: string) => db.deleteTag(id))

  // BookTags
  ipcMain.handle('db:bookTags:getAll', () => db.getAllBookTags())
  ipcMain.handle('db:bookTags:get', (_, bookId: string) => db.getBookTags(bookId))
  ipcMain.handle('db:bookTags:set', (_, bookId: string, tagIds: string[]) => db.setBookTags(bookId, tagIds))

  // Series check
  ipcMain.handle('series:checkAll', () => checkAllSeries())

  // Export / Import
  ipcMain.handle('export:json', () => db.exportAll())
  ipcMain.handle('import:json', (_, jsonStr: string) => {
    const data = JSON.parse(jsonStr)
    db.importAll(data)
  })

}
