<script setup lang="ts">
import type { Book } from '~/composables/useDb'
import { extractAsin, extractUrlSlug, lookupByAsin, searchGoogleBooks } from '~/services/bookLookup'

const { public: { googleBooksApiKey } } = useRuntimeConfig()

useHead({ title: 'Add Book — Bookshelf' })

const { addBook } = useBooks()
const activeTab = ref<'amazon' | 'manual'>('amazon')

// --- Amazon tab state ---
const amazonUrl = ref('')
const lookupLoading = ref(false)
const lookupError = ref('')

// What to show after lookup
type AmazonPhase =
  | { kind: 'idle' }
  | { kind: 'found' }
  | { kind: 'needs_search'; asin: string }

const phase = ref<AmazonPhase>({ kind: 'idle' })

// Search sub-state (active when phase === needs_search)
const searchQuery = ref('')
const searchLoading = ref(false)
const searchResults = ref<Partial<Book>[]>([])
const pendingAsin = ref('')

// Shared book form data
const bookData = ref<Partial<Book>>({ status: 'want_to_read' })

async function handleLookup() {
  const url = amazonUrl.value.trim()
  if (!url) return

  lookupLoading.value = true
  lookupError.value = ''
  phase.value = { kind: 'idle' }
  searchResults.value = []

  try {
    const asin = extractAsin(url)
    if (!asin) {
      lookupError.value = 'Could not find an ASIN in this URL. Make sure it is a valid Amazon product link.'
      return
    }

    const slug = extractUrlSlug(url) ?? undefined
    const result = await lookupByAsin(asin, slug)

    if (result.status === 'found') {
      bookData.value = { ...result.book, amazonUrl: url, status: 'want_to_read' }
      phase.value = { kind: 'found' }
    } else if (result.status === 'needs_search') {
      pendingAsin.value = result.asin
      searchQuery.value = result.suggestedQuery
      phase.value = { kind: 'needs_search', asin: result.asin }
      bookData.value = { asin: result.asin, amazonUrl: url, status: 'want_to_read' }
    } else {
      lookupError.value = 'Lookup failed. Try entering the details manually.'
    }
  } finally {
    lookupLoading.value = false
  }
}

async function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  searchLoading.value = true
  searchResults.value = []
  try {
    searchResults.value = await searchGoogleBooks(q, googleBooksApiKey)
    if (!searchResults.value.length) {
      lookupError.value = 'No results found. Try a shorter or different title.'
    } else {
      lookupError.value = ''
    }
  } finally {
    searchLoading.value = false
  }
}

function selectSearchResult(pick: Partial<Book>) {
  bookData.value = {
    ...pick,
    asin: pendingAsin.value,
    amazonUrl: amazonUrl.value,
    status: 'want_to_read',
  }
  phase.value = { kind: 'found' }
  searchResults.value = []
}

async function handleSave() {
  if (!bookData.value.title || !bookData.value.author) return
  await addBook(bookData.value as Omit<Book, 'id' | 'dateAdded'>)
  await navigateTo('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="font-serif text-[28px] font-medium text-bone">Add a book</h1>
    </div>

    <!-- Tab switcher -->
    <div class="flex gap-1 bg-ink-800 p-1 rounded-lg w-fit">
      <button
        type="button"
        :class="activeTab === 'amazon' ? 'bg-ink-850 shadow-sm text-bone' : 'text-muted'"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
        @click="activeTab = 'amazon'"
      >
        Amazon link
      </button>
      <button
        type="button"
        :class="activeTab === 'manual' ? 'bg-ink-850 shadow-sm text-bone' : 'text-muted'"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
        @click="activeTab = 'manual'"
      >
        Manual entry
      </button>
    </div>

    <!-- Amazon tab -->
    <div v-if="activeTab === 'amazon'" class="space-y-5">

      <!-- URL input -->
      <div class="flex gap-2">
        <input
          v-model="amazonUrl"
          type="url"
          placeholder="Paste Amazon URL…"
          class="field flex-1 px-3 py-2 rounded-lg text-sm"
          @keydown.enter="handleLookup"
        >
        <button
          type="button"
          :disabled="lookupLoading || !amazonUrl"
          class="addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium"
          @click="handleLookup"
        >
          {{ lookupLoading ? 'Looking up…' : 'Look up' }}
        </button>
      </div>

      <p v-if="lookupError" class="text-sm text-red-400">{{ lookupError }}</p>

      <!-- needs_search: prompt user to enter title -->
      <div v-if="phase.kind === 'needs_search'" class="rounded-xl border border-brass-dim/40 bg-brass-dim/10 p-4 space-y-3">
        <p class="text-sm text-brass-soft">
          Could not identify this book automatically — enter the title to search Google Books.
        </p>
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Title or author…"
            class="field flex-1 px-3 py-2 rounded-lg text-sm"
            @keydown.enter="handleSearch"
          >
          <button
            type="button"
            :disabled="searchLoading || !searchQuery"
            class="addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium"
            @click="handleSearch"
          >
            {{ searchLoading ? 'Searching…' : 'Search' }}
          </button>
        </div>

        <!-- Search results picker -->
        <div v-if="searchResults.length" class="space-y-2">
          <button
            v-for="(result, i) in searchResults"
            :key="i"
            type="button"
            class="w-full flex items-center gap-3 p-3 rounded-lg border border-white/8 bg-ink-850 hover:border-brass/40 text-left transition-colors"
            @click="selectSearchResult(result)"
          >
            <CoverImage :src="result.coverUrl" :alt="result.title" class="w-10 h-14 flex-shrink-0 rounded" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-bone truncate">{{ result.title }}</p>
              <p class="text-xs text-muted truncate">{{ result.author }}</p>
              <p v-if="result.publishedDate" class="text-xs text-faint">
                {{ result.publishedDate.length === 4 ? `~${result.publishedDate}` : result.publishedDate }}
              </p>
            </div>
          </button>
        </div>
      </div>

      <!-- found: preview + editable form -->
      <div v-if="phase.kind === 'found'" class="space-y-4">
        <div v-if="bookData.coverUrl || bookData.title" class="flex gap-4">
          <CoverImage :src="bookData.coverUrl" :alt="bookData.title" class="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden" />
          <div class="text-sm text-muted space-y-1">
            <p v-if="bookData.title" class="font-semibold text-bone text-base">{{ bookData.title }}</p>
            <p v-if="bookData.author">by {{ bookData.author }}</p>
            <p v-if="bookData.publishedDate">
              {{ bookData.publishedDate.length === 4 ? `expected ~${bookData.publishedDate}` : bookData.publishedDate }}
            </p>
          </div>
        </div>
        <BookForm v-model="bookData" @submit="handleSave" />
      </div>

    </div>

    <!-- Manual tab -->
    <div v-else>
      <BookForm v-model="bookData" @submit="handleSave" />
    </div>
  </div>
</template>
