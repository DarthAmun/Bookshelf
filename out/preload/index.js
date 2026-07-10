"use strict";
const electron = require("electron");
const api = {
  scrapeBook: (url) => electron.ipcRenderer.invoke("scrape:book", url),
  scrapeSeries: (url) => electron.ipcRenderer.invoke("scrape:series", url),
  getBooks: () => electron.ipcRenderer.invoke("db:books:getAll"),
  getBook: (id) => electron.ipcRenderer.invoke("db:books:get", id),
  saveBook: (book) => electron.ipcRenderer.invoke("db:books:save", book),
  updateBook: (id, data) => electron.ipcRenderer.invoke("db:books:update", id, data),
  deleteBook: (id) => electron.ipcRenderer.invoke("db:books:delete", id),
  getSeries: () => electron.ipcRenderer.invoke("db:series:getAll"),
  saveSeries: (series) => electron.ipcRenderer.invoke("db:series:save", series),
  updateSeries: (id, data) => electron.ipcRenderer.invoke("db:series:update", id, data),
  deleteSeries: (id) => electron.ipcRenderer.invoke("db:series:delete", id),
  getAllReviews: () => electron.ipcRenderer.invoke("db:reviews:getAll"),
  getReview: (bookId) => electron.ipcRenderer.invoke("db:reviews:get", bookId),
  saveReview: (review) => electron.ipcRenderer.invoke("db:reviews:save", review),
  getTags: () => electron.ipcRenderer.invoke("db:tags:getAll"),
  saveTag: (tag) => electron.ipcRenderer.invoke("db:tags:save", tag),
  updateTag: (id, data) => electron.ipcRenderer.invoke("db:tags:update", id, data),
  deleteTag: (id) => electron.ipcRenderer.invoke("db:tags:delete", id),
  getAllBookTags: () => electron.ipcRenderer.invoke("db:bookTags:getAll"),
  getBookTags: (bookId) => electron.ipcRenderer.invoke("db:bookTags:get", bookId),
  setBookTags: (bookId, tagIds) => electron.ipcRenderer.invoke("db:bookTags:set", bookId, tagIds),
  checkAllSeries: () => electron.ipcRenderer.invoke("series:checkAll"),
  exportJson: () => electron.ipcRenderer.invoke("export:json"),
  importJson: (jsonStr) => electron.ipcRenderer.invoke("import:json", jsonStr),
  amazonLogin: () => electron.ipcRenderer.invoke("amazon:login"),
  amazonIsLoggedIn: () => electron.ipcRenderer.invoke("amazon:isLoggedIn")
};
electron.contextBridge.exposeInMainWorld("bookshelf", api);
