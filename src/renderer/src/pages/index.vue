<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLibraryStore } from '../stores/library'
import { storeToRefs } from 'pinia'
import type { Review } from '~/types'
import type { FilterState } from '~/components/FilterBar.vue'

const filters = ref<FilterState>({
  status: 'all',
  genre: '',
  seriesId: '',
  tagId: '',
  sort: 'dateAdded',
  search: '',
})

const store = useLibraryStore()
const { books: allBooks, reviews: allReviews, bookTags: allBookTags, series: allSeries } = storeToRefs(store)

const seriesWithNew = computed(() => allSeries.value.filter(s => s.newReleaseAvailable))

const reviewMap = computed(() => {
  const map: Record<string, Review> = {}
  allReviews.value.forEach(r => { map[r.bookId] = r })
  return map
})

const booksByTag = computed(() => {
  const map: Record<string, Set<string>> = {}
  allBookTags.value.forEach(bt => {
    if (!map[bt.tagId]) map[bt.tagId] = new Set()
    map[bt.tagId].add(bt.bookId)
  })
  return map
})

const filteredBooks = computed(() => {
  let books = [...allBooks.value]
  const f = filters.value

  if (f.status !== 'all') books = books.filter(b => b.status === f.status)
  if (f.genre) books = books.filter(b => b.genre === f.genre)
  if (f.seriesId) books = books.filter(b => b.seriesId === f.seriesId)
  if (f.tagId) {
    const ids = booksByTag.value[f.tagId] ?? new Set()
    books = books.filter(b => ids.has(b.id))
  }
  if (f.search) {
    const q = f.search.toLowerCase()
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    )
  }

  books.sort((a, b) => {
    switch (f.sort) {
      case 'title': return a.title.localeCompare(b.title)
      case 'author': return a.author.localeCompare(b.author)
      case 'rating': {
        const ra = reviewMap.value[a.id]?.rating ?? 0
        const rb = reviewMap.value[b.id]?.rating ?? 0
        return rb - ra
      }
      case 'dateRead': {
        const da = reviewMap.value[a.id]?.dateRead ?? 0
        const db2 = reviewMap.value[b.id]?.dateRead ?? 0
        return db2 - da
      }
      default: return b.dateAdded - a.dateAdded
    }
  })

  return books
})

const lastAddedDaysAgo = computed(() => {
  if (!allBooks.value.length) return null
  const latest = allBooks.value.reduce((m, b) => b.dateAdded > m ? b.dateAdded : m, 0)
  const days = Math.floor((Date.now() - latest) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
})

const addModal = ref<{ open: () => void } | null>(null)

function handleAdded(id: string) {
  nextTick(() => document.querySelector(`[data-book-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}
</script>

<template>
  <div>
    <header class="flex items-end justify-between">
      <div>
        <h1 class="font-serif text-[40px] font-medium leading-none tracking-tight text-bone">Library</h1>
        <p class="mt-2.5 font-mono text-[11px] uppercase tracking-[.16em] text-faint">
          {{ allBooks.length }} volumes catalogued
          <template v-if="lastAddedDaysAgo"> · last added {{ lastAddedDaysAgo }}</template>
        </p>
      </div>
      <div class="hidden font-mono text-[11px] text-faint sm:block">No. <span class="text-muted">823.91</span></div>
    </header>

    <NewReleaseBanner :series="seriesWithNew" class="mt-7" />
    <FilterBar v-model="filters" class="mt-7" />
    <BookGrid :books="filteredBooks" :reviews="reviewMap" class="mt-10" />

    <p v-if="!filteredBooks.length" class="py-24 text-center font-serif text-[17px] italic text-faint">
      No volumes on this shelf.
    </p>

    <p class="mt-2 text-center font-mono text-[10px] uppercase tracking-[.14em] text-faint/70">
      Drop an image onto any book to set its cover
    </p>

    <button
      type="button"
      class="fab fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brass text-ink-950"
      aria-label="Add a book"
      @click="addModal?.open()"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <AddBookModal ref="addModal" @added="handleAdded" />
  </div>
</template>
