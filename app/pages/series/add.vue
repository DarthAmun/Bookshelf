<script setup lang="ts">
import type { BookMeta } from '~/services/bookLookup'
import { searchSeriesBooks } from '~/services/bookLookup'
import { addSeries, findSeriesByName } from '~/composables/useSeries'

useHead({ title: 'Import Series — Bookshelf' })

const { public: { googleBooksApiKey } } = useRuntimeConfig()
const { addBook } = useBooks()

const seriesName = ref('')
const authorName = ref('')
const searching = ref(false)
const searchError = ref('')

interface SelectableBook extends BookMeta {
  selected: boolean
  positionOverride: number | undefined
}

const results = ref<SelectableBook[]>([])
const hasSearched = computed(() => results.value.length > 0 || searchError.value !== '')

async function handleSearch() {
  if (!seriesName.value.trim() || !authorName.value.trim()) return
  searching.value = true
  searchError.value = ''
  results.value = []
  try {
    const books = await searchSeriesBooks(seriesName.value.trim(), authorName.value.trim(), googleBooksApiKey)
    if (!books.length) {
      searchError.value = 'No results found. Try a different series name or author spelling.'
      return
    }
    results.value = books.map(b => ({ ...b, selected: true, positionOverride: undefined }))
  } finally {
    searching.value = false
  }
}

const selectedCount = computed(() => results.value.filter(b => b.selected).length)

const importing = ref(false)

async function handleImport() {
  const selected = results.value.filter(b => b.selected)
  if (!selected.length) return
  importing.value = true
  try {
    let series = await findSeriesByName(seriesName.value.trim())
    if (!series) {
      series = await addSeries({
        name: seriesName.value.trim(),
        author: authorName.value.trim(),
        knownTotal: selected.length,
        newReleaseAvailable: false,
      })
    }
    await Promise.all(selected.map(book => addBook({
      title: book.title ?? '',
      author: book.author ?? authorName.value.trim(),
      coverUrl: book.coverUrl,
      isbn: book.isbn,
      googleBooksId: book.googleBooksId,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      description: book.description,
      pageCount: book.pageCount,
      language: book.language,
      genre: book.genre,
      seriesId: series.id,
      seriesPosition: book.positionOverride ?? book.seriesPosHint,
      status: 'want_to_read',
    })))
    await navigateTo(`/series/${series.id}`)
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/series" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="font-serif text-[28px] font-medium text-bone">Import series</h1>
    </div>

    <!-- Search form -->
    <div class="bg-ink-850 rounded-xl border hair p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          v-model="seriesName"
          type="text"
          placeholder="Series name"
          class="field px-3 py-2 rounded-lg text-sm"
          @keydown.enter="handleSearch"
        >
        <input
          v-model="authorName"
          type="text"
          placeholder="Author"
          class="field px-3 py-2 rounded-lg text-sm"
          @keydown.enter="handleSearch"
        >
      </div>
      <button
        type="button"
        :disabled="searching || !seriesName || !authorName"
        class="addbtn px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        @click="handleSearch"
      >
        {{ searching ? 'Searching…' : 'Search Google Books' }}
      </button>
    </div>

    <p v-if="searchError" class="text-sm text-red-400">{{ searchError }}</p>

    <!-- Results -->
    <div v-if="results.length" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted">
          Found {{ results.length }} books — {{ selectedCount }} selected
        </p>
        <div class="flex gap-2 text-sm">
          <button type="button" class="text-faint hover:text-muted" @click="results.forEach(b => b.selected = true)">
            Select all
          </button>
          <span class="text-faint">·</span>
          <button type="button" class="text-faint hover:text-muted" @click="results.forEach(b => b.selected = false)">
            None
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label
          v-for="(book, i) in results"
          :key="i"
          class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="book.selected ? 'border-brass/40 bg-ink-850' : 'border-white/8 bg-ink-850/50 opacity-60'"
        >
          <input v-model="book.selected" type="checkbox" class="accent-brass w-4 h-4 flex-shrink-0">
          <CoverImage :src="book.coverUrl" :alt="book.title" class="w-9 h-13 flex-shrink-0 rounded" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-bone truncate">{{ book.title }}</p>
              <span
                v-if="book.seriesPosHint"
                class="flex-shrink-0 text-xs text-brass-soft bg-brass-dim/20 px-1.5 py-0.5 rounded"
              >
                #{{ book.seriesPosHint }}
              </span>
            </div>
            <p class="text-xs text-muted truncate">{{ book.author }}</p>
            <p v-if="book.publishedDate" class="text-xs text-faint">{{ book.publishedDate }}</p>
          </div>
          <div v-if="!book.seriesPosHint" class="flex-shrink-0">
            <input
              v-model.number="book.positionOverride"
              type="number"
              min="1"
              placeholder="#"
              class="field w-14 px-2 py-1 rounded text-xs text-center"
              title="Set book position in series"
            >
          </div>
        </label>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          :disabled="importing || selectedCount === 0"
          class="addbtn px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          @click="handleImport"
        >
          {{ importing ? 'Importing…' : `Import ${selectedCount} book${selectedCount === 1 ? '' : 's'}` }}
        </button>
        <NuxtLink to="/series" class="px-4 py-2 text-sm text-muted hover:text-bone">
          Cancel
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="hasSearched && !searching" class="text-center py-10 text-faint text-sm">
      No matching books found.
    </div>
  </div>
</template>
