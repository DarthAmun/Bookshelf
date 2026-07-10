/// <reference types="vite/client" />
import type { BookshelfAPI } from '../../preload/index'

declare global {
  interface Window {
    bookshelf: BookshelfAPI
  }
}
