<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addBook } from '~/composables/useBooks'
import { addSeries, findSeriesByName } from '~/composables/useSeries'
useHead({ title: 'Import Series — Bookshelf' })

const router = useRouter()

const amazonUrl = ref('')
const scraping = ref(false)
const scrapeError = ref('')
const scrapeStatus = ref('')

interface SelectableBook {
  title: string
  asin: string
  coverUrl?: string
  seriesPosition?: number
  releaseDate?: string
  selected: boolean
}

const scrapedData = ref<{ seriesName: string; author: string; books: SelectableBook[] } | null>(null)

async function handleScrape() {
  const url = amazonUrl.value.trim()
  if (!url) return
  scraping.value = true
  scrapeError.value = ''
  scrapedData.value = null
  scrapeStatus.value = 'Loading series page…'

  const phaseTimer = setTimeout(() => { scrapeStatus.value = 'Waiting for Amazon to render…' }, 6000)

  try {
    const result = await window.bookshelf.scrapeSeries(url)
    if (result.error) {
      scrapeError.value = result.error
      return
    }
    if (!result.books.length) {
      scrapeError.value = 'No books found on this page. Make sure it is an Amazon series page URL.'
      return
    }
    scrapedData.value = {
      seriesName: result.seriesName ?? '',
      author: result.author ?? '',
      books: result.books.map(b => ({ ...b, selected: true })),
    }
  } finally {
    clearTimeout(phaseTimer)
    scraping.value = false
    scrapeStatus.value = ''
  }
}


const selectedCount = computed(() => scrapedData.value?.books.filter(b => b.selected).length ?? 0)

const importing = ref(false)

async function handleImport() {
  const data = scrapedData.value
  if (!data) return
  const selected = data.books.filter(b => b.selected)
  if (!selected.length) return

  importing.value = true
  try {
    let series = await findSeriesByName(data.seriesName)
    if (!series) {
      series = await addSeries({
        name: data.seriesName,
        author: data.author,
        knownTotal: selected.length,
        amazonUrl: amazonUrl.value,
        newReleaseAvailable: false,
      })
    }
    for (const book of selected) {
      await addBook({
        title: book.title,
        author: data.author,
        coverUrl: book.coverUrl,
        asin: book.asin,
        amazonUrl: `https://www.amazon.de/dp/${book.asin}`,
        publishedDate: book.releaseDate,
        seriesId: series.id,
        seriesPosition: book.seriesPosition,
        status: 'want_to_read',
      })
    }
    router.push(`/series/${series.id}`)
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/series" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </RouterLink>
      <h1 class="font-serif text-[28px] font-medium text-bone">Import series</h1>
    </div>

    <div class="bg-ink-850 rounded-xl border hair p-4 space-y-3">
      <p class="text-sm text-muted">Paste an Amazon series page URL to import the full book list.</p>
      <div class="flex gap-2">
        <input
          v-model="amazonUrl"
          type="url"
          placeholder="https://www.amazon.de/dp/…?binding=kindle_edition"
          class="field flex-1 px-3 py-2 rounded-lg text-sm"
          @keydown.enter="handleScrape"
        >
        <button
          type="button"
          :disabled="scraping || !amazonUrl"
          class="addbtn px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          @click="handleScrape"
        >
          {{ scraping ? 'Fetching…' : 'Import' }}
        </button>
      </div>
      <div v-if="scraping" class="flex items-center gap-2 text-sm text-muted">
        <svg class="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>{{ scrapeStatus }}</span>
      </div>
      <p v-if="scrapeError" class="text-sm text-red-400">{{ scrapeError }}</p>
    </div>

    <div v-if="scrapedData" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="lbl block mb-1">Series name</label>
          <input v-model="scrapedData.seriesName" type="text" class="field w-full px-3 py-2 rounded-lg text-sm">
        </div>
        <div>
          <label class="lbl block mb-1">Author</label>
          <input v-model="scrapedData.author" type="text" class="field w-full px-3 py-2 rounded-lg text-sm">
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm text-muted">
          Found {{ scrapedData.books.length }} books — {{ selectedCount }} selected
        </p>
        <div class="flex gap-2 text-sm">
          <button type="button" class="text-faint hover:text-muted" @click="scrapedData.books.forEach(b => b.selected = true)">
            All
          </button>
          <span class="text-faint">·</span>
          <button type="button" class="text-faint hover:text-muted" @click="scrapedData.books.forEach(b => b.selected = false)">
            None
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label
          v-for="(book, i) in scrapedData.books"
          :key="i"
          class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="book.selected ? 'border-brass/40 bg-ink-850' : 'border-white/8 bg-ink-850/50 opacity-60'"
        >
          <input v-model="book.selected" type="checkbox" class="accent-brass w-4 h-4 flex-shrink-0">
          <CoverImage :src="book.coverUrl" :alt="book.title" class="w-9 h-12 flex-shrink-0 rounded" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-bone truncate">{{ book.title }}</p>
              <span
                v-if="book.seriesPosition"
                class="flex-shrink-0 text-xs text-brass-soft bg-brass-dim/20 px-1.5 py-0.5 rounded"
              >#{{ book.seriesPosition }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span v-if="book.asin" class="font-mono text-[10px] text-faint">{{ book.asin }}</span>
              <span v-if="book.releaseDate" class="text-xs text-[#9bc093]">Releases {{ book.releaseDate }}</span>
              <span v-if="!book.coverUrl" class="text-xs text-faint italic">no cover</span>
            </div>
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
        <RouterLink to="/series" class="px-4 py-2 text-sm text-muted hover:text-bone">
          Cancel
        </RouterLink>
      </div>
    </div>
  </div>
</template>
