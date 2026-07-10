"use strict";
const electron = require("electron");
const path = require("path");
const cron = require("node-cron");
const Database = require("better-sqlite3");
const cheerio = require("cheerio");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const cron__namespace = /* @__PURE__ */ _interopNamespaceDefault(cron);
const cheerio__namespace = /* @__PURE__ */ _interopNamespaceDefault(cheerio);
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
let db;
function initDb() {
  const dbPath = path.join(electron.app.getPath("userData"), "bookshelf.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createTables();
  return db;
}
function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      author TEXT,
      amazon_url TEXT,
      known_total INTEGER,
      last_checked INTEGER,
      next_book_title TEXT,
      next_book_date TEXT,
      new_release_available INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_url TEXT,
      amazon_url TEXT,
      amazon_series_url TEXT,
      asin TEXT,
      series_id TEXT REFERENCES series(id),
      series_position INTEGER,
      status TEXT NOT NULL DEFAULT 'want_to_read',
      genre TEXT,
      description TEXT,
      published_date TEXT,
      publisher TEXT,
      page_count INTEGER,
      date_added INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      rating INTEGER,
      review_text TEXT,
      contains_spoilers INTEGER NOT NULL DEFAULT 0,
      date_read INTEGER,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_tags (
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, tag_id)
    );
  `);
}
function rowToBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url || void 0,
    amazonUrl: row.amazon_url || void 0,
    amazonSeriesUrl: row.amazon_series_url || void 0,
    asin: row.asin || void 0,
    seriesId: row.series_id || void 0,
    seriesPosition: row.series_position || void 0,
    status: row.status,
    genre: row.genre || void 0,
    description: row.description || void 0,
    publishedDate: row.published_date || void 0,
    publisher: row.publisher || void 0,
    pageCount: row.page_count || void 0,
    dateAdded: row.date_added
  };
}
function rowToSeries(row) {
  return {
    id: row.id,
    name: row.name,
    author: row.author || void 0,
    amazonUrl: row.amazon_url || void 0,
    knownTotal: row.known_total || void 0,
    lastChecked: row.last_checked || void 0,
    nextBookTitle: row.next_book_title || void 0,
    nextBookDate: row.next_book_date || void 0,
    newReleaseAvailable: !!row.new_release_available
  };
}
function rowToReview(row) {
  return {
    id: row.id,
    bookId: row.book_id,
    rating: row.rating || void 0,
    reviewText: row.review_text || void 0,
    containsSpoilers: !!row.contains_spoilers,
    dateRead: row.date_read || void 0,
    updatedAt: row.updated_at
  };
}
function getAllBooks() {
  return db.prepare("SELECT * FROM books ORDER BY date_added DESC").all().map(rowToBook);
}
function getBook(id) {
  const row = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  return row ? rowToBook(row) : void 0;
}
function saveBook(book) {
  db.prepare(`
    INSERT OR REPLACE INTO books
      (id, title, author, cover_url, amazon_url, amazon_series_url, asin,
       series_id, series_position, status, genre, description, published_date,
       publisher, page_count, date_added)
    VALUES
      (@id, @title, @author, @coverUrl, @amazonUrl, @amazonSeriesUrl, @asin,
       @seriesId, @seriesPosition, @status, @genre, @description, @publishedDate,
       @publisher, @pageCount, @dateAdded)
  `).run({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl ?? null,
    amazonUrl: book.amazonUrl ?? null,
    amazonSeriesUrl: book.amazonSeriesUrl ?? null,
    asin: book.asin ?? null,
    seriesId: book.seriesId ?? null,
    seriesPosition: book.seriesPosition ?? null,
    status: book.status,
    genre: book.genre ?? null,
    description: book.description ?? null,
    publishedDate: book.publishedDate ?? null,
    publisher: book.publisher ?? null,
    pageCount: book.pageCount ?? null,
    dateAdded: book.dateAdded
  });
}
function updateBook(id, data) {
  const existing = getBook(id);
  if (!existing) return;
  saveBook({ ...existing, ...data });
}
function deleteBook(id) {
  db.prepare("DELETE FROM books WHERE id = ?").run(id);
}
function getAllSeries() {
  return db.prepare("SELECT * FROM series ORDER BY name").all().map(rowToSeries);
}
function getSeriesById(id) {
  const row = db.prepare("SELECT * FROM series WHERE id = ?").get(id);
  return row ? rowToSeries(row) : void 0;
}
function saveSeries(series) {
  db.prepare(`
    INSERT OR REPLACE INTO series
      (id, name, author, amazon_url, known_total, last_checked,
       next_book_title, next_book_date, new_release_available)
    VALUES
      (@id, @name, @author, @amazonUrl, @knownTotal, @lastChecked,
       @nextBookTitle, @nextBookDate, @newReleaseAvailable)
  `).run({
    id: series.id,
    name: series.name,
    author: series.author ?? null,
    amazonUrl: series.amazonUrl ?? null,
    knownTotal: series.knownTotal ?? null,
    lastChecked: series.lastChecked ?? null,
    nextBookTitle: series.nextBookTitle ?? null,
    nextBookDate: series.nextBookDate ?? null,
    newReleaseAvailable: series.newReleaseAvailable ? 1 : 0
  });
}
function updateSeries(id, data) {
  const existing = getSeriesById(id);
  if (!existing) return;
  saveSeries({ ...existing, ...data });
}
function deleteSeries(id) {
  db.transaction(() => {
    db.prepare("UPDATE books SET series_id = NULL, series_position = NULL WHERE series_id = ?").run(id);
    db.prepare("DELETE FROM series WHERE id = ?").run(id);
  })();
}
function getAllReviews() {
  return db.prepare("SELECT * FROM reviews").all().map(rowToReview);
}
function getReview(bookId) {
  const row = db.prepare("SELECT * FROM reviews WHERE book_id = ?").get(bookId);
  return row ? rowToReview(row) : void 0;
}
function saveReview(review) {
  db.prepare(`
    INSERT OR REPLACE INTO reviews
      (id, book_id, rating, review_text, contains_spoilers, date_read, updated_at)
    VALUES
      (@id, @bookId, @rating, @reviewText, @containsSpoilers, @dateRead, @updatedAt)
  `).run({
    id: review.id,
    bookId: review.bookId,
    rating: review.rating ?? null,
    reviewText: review.reviewText ?? null,
    containsSpoilers: review.containsSpoilers ? 1 : 0,
    dateRead: review.dateRead ?? null,
    updatedAt: review.updatedAt
  });
}
function getAllTags() {
  return db.prepare("SELECT * FROM tags ORDER BY label").all();
}
function saveTag(tag) {
  db.prepare("INSERT OR REPLACE INTO tags (id, label, color) VALUES (@id, @label, @color)").run(tag);
}
function updateTag(id, data) {
  const existing = db.prepare("SELECT * FROM tags WHERE id = ?").get(id);
  if (!existing) return;
  saveTag({ ...existing, ...data });
}
function deleteTag(id) {
  db.prepare("DELETE FROM tags WHERE id = ?").run(id);
}
function getAllBookTags() {
  return db.prepare("SELECT book_id as bookId, tag_id as tagId FROM book_tags").all();
}
function getBookTags(bookId) {
  const rows = db.prepare("SELECT tag_id as tagId FROM book_tags WHERE book_id = ?").all(bookId);
  return rows.map((r) => r.tagId);
}
function setBookTags(bookId, tagIds) {
  db.transaction(() => {
    db.prepare("DELETE FROM book_tags WHERE book_id = ?").run(bookId);
    for (const tagId of tagIds) {
      db.prepare("INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)").run(bookId, tagId);
    }
  })();
}
function exportAll() {
  return {
    books: getAllBooks(),
    series: getAllSeries(),
    reviews: getAllReviews(),
    tags: getAllTags(),
    bookTags: getAllBookTags()
  };
}
function importAll(data) {
  db.transaction(() => {
    if (data.series?.length) data.series.forEach((s) => saveSeries(s));
    if (data.books?.length) data.books.forEach((b) => saveBook(b));
    if (data.reviews?.length) data.reviews.forEach((r) => saveReview(r));
    if (data.tags?.length) data.tags.forEach((t) => saveTag(t));
    if (data.bookTags?.length) {
      for (const bt of data.bookTags) {
        db.prepare("INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)").run(bt.bookId, bt.tagId);
      }
    }
  })();
}
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const HEADERS = {
  "User-Agent": USER_AGENT,
  "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
};
function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1e3 + Math.random() * 1e3));
}
function extractAsin(url) {
  const m = url.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/);
  return m ? m[1] : null;
}
function isCaptcha(html) {
  return html.includes("Robot Check") || html.includes("CAPTCHA") || html.includes("captcha");
}
async function scrapeAmazonBook(url) {
  await delay();
  try {
    const cookieList = await electron.session.defaultSession.cookies.get({ domain: ".amazon.de" });
    const cookieHeader = cookieList.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await fetch(url, {
      headers: { ...HEADERS, ...cookieHeader ? { Cookie: cookieHeader } : {} }
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    if (isCaptcha(html)) return { error: "Amazon returned a CAPTCHA page. Try again later." };
    const $ = cheerio__namespace.load(html);
    const title = $("#productTitle").text().trim();
    if (!title) return { error: "Could not extract book title. The page structure may have changed." };
    const author = $(".author .contributorNameID").first().text().trim() || $("a.contributorNameID").first().text().trim() || $(".author a").first().text().trim() || void 0;
    let coverUrl;
    const imgDataAttr = $("#imgBlurImage").attr("data-a-dynamic-image") || $("#ebooksImgBlurImage").attr("data-a-dynamic-image") || $("#img-canvas img").attr("data-a-dynamic-image");
    if (imgDataAttr) {
      try {
        const imgMap = JSON.parse(imgDataAttr);
        const urls = Object.keys(imgMap);
        coverUrl = urls.sort((a, b) => {
          const [wa, ha] = imgMap[a] ?? [0, 0];
          const [wb, hb] = imgMap[b] ?? [0, 0];
          return wb * hb - wa * ha;
        })[0];
      } catch {
      }
    }
    if (!coverUrl) {
      coverUrl = $("#landingImage").attr("src") || $("#img-canvas img").first().attr("src") || $("#main-image").attr("src") || void 0;
    }
    let seriesName;
    let seriesPosition;
    const seriesBulletText = $("#seriesBullet_feature_div").text().trim();
    if (seriesBulletText) {
      const posMatch = seriesBulletText.match(/Book\s+(\d+)/i);
      if (posMatch) seriesPosition = parseInt(posMatch[1]);
      const nameMatch = seriesBulletText.match(/:\s*(.+)$/) || seriesBulletText.match(/\(([^)]+)\)/);
      if (nameMatch) seriesName = nameMatch[1].trim();
    }
    const description = $("#bookDescription_feature_div .a-expander-content").text().trim() || $("#productDescription p").first().text().trim() || void 0;
    const asin = extractAsin(url) || void 0;
    const detailText = $("#detailBullets_feature_div").text() + $("#detailBulletsWrapper_feature_div").text();
    const dateMatch = detailText.match(/(\d{1,2}\.\s*\w+\s*\d{4})/);
    const publishedDate = dateMatch ? dateMatch[1] : void 0;
    return { title, author, coverUrl, seriesName, seriesPosition, description, asin, publishedDate };
  } catch (e) {
    return { error: String(e) };
  }
}
async function loadSeriesPageWithJs(url) {
  const cookies = await electron.session.defaultSession.cookies.get({ domain: ".amazon.de" });
  console.log(`[scraper/BW] session has ${cookies.length} amazon.de cookies: ${cookies.map((c) => c.name).join(", ")}`);
  return new Promise((resolve, reject) => {
    const win = new electron.BrowserWindow({
      show: false,
      skipTaskbar: true,
      webPreferences: {
        contextIsolation: true,
        allowRunningInsecureContent: true
      }
    });
    const hardTimeout = setTimeout(() => {
      win.destroy();
      reject(new Error("Series page load timed out"));
    }, 45e3);
    win.webContents.setUserAgent(USER_AGENT);
    win.loadURL(url, { userAgent: USER_AGENT }).then(async () => {
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
        `);
      await new Promise((r) => setTimeout(r, 2e3));
      const html = await win.webContents.executeJavaScript("document.documentElement.outerHTML");
      clearTimeout(hardTimeout);
      win.destroy();
      resolve(html);
    }).catch((e) => {
      clearTimeout(hardTimeout);
      win.destroy();
      reject(e);
    });
  });
}
async function scrapeAmazonSeries(url) {
  await delay();
  try {
    let html;
    try {
      html = await loadSeriesPageWithJs(url);
    } catch (e) {
      return { books: [], error: `Failed to load page: ${String(e)}` };
    }
    if (isCaptcha(html)) return { books: [], error: "Amazon returned a CAPTCHA page. Try again later." };
    const $ = cheerio__namespace.load(html);
    const seriesName = $("span#title").first().text().trim() || $("#collection-title").text().trim() || $("h1.a-size-large").first().text().trim() || void 0;
    const authorRaw = $('bds-link[label*="(Autor)"]').first().attr("label") || $('bds-link[label*="(Author)"]').first().attr("label") || $(".author .contributorNameID").first().text().trim() || $("a.contributorNameID").first().text().trim() || "";
    const author = authorRaw ? authorRaw.replace(/\s*\([^)]+\)\s*$/, "").trim() || void 0 : void 0;
    const books = [];
    const itemEls = $(".series-childAsin-item").toArray();
    itemEls.forEach((el, idx) => {
      const $el = $(el);
      const asin = $el.attr("data-asin") || extractAsin($el.find("a").first().attr("href") ?? "");
      if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return;
      const title = $el.find(".itemBookTitle h3").first().text().trim() || $el.find("h2, h3").first().text().trim();
      if (!title) return;
      const coverUrl = $el.find("img.asinImage").first().attr("src") || $el.find("img").first().attr("src") || void 0;
      const posLabelText = $el.find(".itemPositionLabel").text().trim();
      const posFromLabel = posLabelText ? parseInt(posLabelText) : NaN;
      const seriesPosition = !isNaN(posFromLabel) ? posFromLabel : idx + 1;
      const $grid = $el.closest(".a-fixed-right-grid");
      const $scope = $grid.length ? $grid : $el;
      const releaseDate = $scope.find(".a-color-success.a-text-bold").first().text().trim() || void 0;
      books.push({ title, asin, coverUrl, seriesPosition, releaseDate });
    });
    if (!books.length) {
      $("[data-asin]").each((_, el) => {
        const $el = $(el);
        const asin = $el.attr("data-asin");
        if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return;
        const title = $el.find("h2 span.a-text-normal, h2 a span").first().text().trim() || $el.find(".a-size-medium.a-color-base.a-text-normal").first().text().trim();
        if (!title) return;
        const coverUrl = $el.find("img").first().attr("src") || void 0;
        books.push({ title, asin, coverUrl });
      });
    }
    return { seriesName, author, books, totalBooks: books.length };
  } catch (e) {
    return { books: [], error: String(e) };
  }
}
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => mainWindow.show());
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.personal.bookshelf");
  electron.app.on("browser-window-created", (_, win) => optimizer.watchWindowShortcuts(win));
  initDb();
  registerIpcHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  cron__namespace.schedule("0 10 * * 1", () => {
    checkAllSeries();
  });
  checkSeriesIfStale();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
async function checkSeriesIfStale() {
  const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1e3;
  const stale = getAllSeries().filter(
    (s) => s.amazonUrl && (!s.lastChecked || s.lastChecked < staleThreshold)
  );
  if (stale.length) await checkAllSeries();
}
async function checkAllSeries() {
  const allSeries = getAllSeries();
  const allBooks = getAllBooks();
  let anyNew = false;
  for (const series of allSeries) {
    if (!series.amazonUrl) continue;
    const result = await scrapeAmazonSeries(series.amazonUrl);
    if (result.error || !result.books.length) continue;
    const seriesBookAsins = new Set(
      allBooks.filter((b) => b.seriesId === series.id).map((b) => b.asin).filter(Boolean)
    );
    const newBooks = result.books.filter((b) => b.asin && !seriesBookAsins.has(b.asin));
    const hasNew = newBooks.length > 0;
    if (hasNew) anyNew = true;
    const nextBook = newBooks.sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))[0];
    updateSeries(series.id, {
      lastChecked: Date.now(),
      newReleaseAvailable: hasNew || series.newReleaseAvailable,
      nextBookTitle: nextBook?.title ?? series.nextBookTitle,
      nextBookDate: nextBook?.releaseDate ?? nextBook?.publishedDate ?? series.nextBookDate,
      knownTotal: result.totalBooks ?? series.knownTotal
    });
  }
  if (anyNew) {
    new electron.Notification({
      title: "Bookshelf",
      body: "New entries found in your tracked series!"
    }).show();
  }
  return anyNew;
}
function registerIpcHandlers() {
  electron.ipcMain.handle("scrape:book", (_, url) => scrapeAmazonBook(url));
  electron.ipcMain.handle("scrape:series", (_, url) => scrapeAmazonSeries(url));
  electron.ipcMain.handle("db:books:getAll", () => getAllBooks());
  electron.ipcMain.handle("db:books:get", (_, id) => getBook(id));
  electron.ipcMain.handle("db:books:save", (_, book) => saveBook(book));
  electron.ipcMain.handle("db:books:update", (_, id, data) => updateBook(id, data));
  electron.ipcMain.handle("db:books:delete", (_, id) => deleteBook(id));
  electron.ipcMain.handle("db:series:getAll", () => getAllSeries());
  electron.ipcMain.handle("db:series:save", (_, series) => saveSeries(series));
  electron.ipcMain.handle("db:series:update", (_, id, data) => updateSeries(id, data));
  electron.ipcMain.handle("db:series:delete", (_, id) => deleteSeries(id));
  electron.ipcMain.handle("db:reviews:getAll", () => getAllReviews());
  electron.ipcMain.handle("db:reviews:get", (_, bookId) => getReview(bookId));
  electron.ipcMain.handle("db:reviews:save", (_, review) => saveReview(review));
  electron.ipcMain.handle("db:tags:getAll", () => getAllTags());
  electron.ipcMain.handle("db:tags:save", (_, tag) => saveTag(tag));
  electron.ipcMain.handle("db:tags:update", (_, id, data) => updateTag(id, data));
  electron.ipcMain.handle("db:tags:delete", (_, id) => deleteTag(id));
  electron.ipcMain.handle("db:bookTags:getAll", () => getAllBookTags());
  electron.ipcMain.handle("db:bookTags:get", (_, bookId) => getBookTags(bookId));
  electron.ipcMain.handle("db:bookTags:set", (_, bookId, tagIds) => setBookTags(bookId, tagIds));
  electron.ipcMain.handle("series:checkAll", () => checkAllSeries());
  electron.ipcMain.handle("export:json", () => exportAll());
  electron.ipcMain.handle("import:json", (_, jsonStr) => {
    const data = JSON.parse(jsonStr);
    importAll(data);
  });
  electron.ipcMain.handle("amazon:login", () => {
    const win = new electron.BrowserWindow({
      width: 460,
      height: 640,
      title: "Amazon anmelden",
      autoHideMenuBar: true
    });
    win.loadURL("https://www.amazon.de/gp/sign-in.html");
    return new Promise((resolve) => {
      win.on("closed", () => resolve());
    });
  });
  electron.ipcMain.handle("amazon:isLoggedIn", async () => {
    const cookies = await electron.session.defaultSession.cookies.get({ domain: ".amazon.de", name: "session-id" });
    return cookies.length > 0;
  });
}
