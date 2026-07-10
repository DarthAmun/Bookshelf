<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLibraryStore } from '../../stores/library'
import type { Book } from '~/types'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const store = useLibraryStore()
const series = computed(() => store.series.find(s => s.id === id))
const seriesBooks = computed(() => store.books.filter(b => b.seriesId === id))

useHead(() => ({ title: series.value ? `${series.value.name} — Bookshelf` : 'Series — Bookshelf' }))

const { updateSeries, deleteSeries } = useSeries()

const editing = ref(false)
const editData = ref<{
  knownTotal?: number
  amazonUrl?: string
  nextBookTitle?: string
  nextBookDate?: string
}>({})

watch(series, (s) => {
  if (s) {
    editData.value = {
      knownTotal: s.knownTotal,
      amazonUrl: s.amazonUrl,
      nextBookTitle: s.nextBookTitle,
      nextBookDate: s.nextBookDate,
    }
  }
}, { immediate: true })

async function saveEdit() {
  await updateSeries(id, editData.value)
  editing.value = false
}

const checkingNow = ref(false)
async function checkNow() {
  if (!series.value?.amazonUrl) return
  checkingNow.value = true
  try {
    const result = await window.bookshelf.scrapeSeries(series.value.amazonUrl)
    if (!result.error && result.books.length) {
      const existingAsins = new Set(seriesBooks.value.map(b => b.asin).filter(Boolean))
      const newBooks = result.books.filter(b => b.asin && !existingAsins.has(b.asin))
      const hasNew = newBooks.length > 0
      const nextBook = newBooks.sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))[0]
      await window.bookshelf.updateSeries(id, {
        lastChecked: Date.now(),
        newReleaseAvailable: hasNew || (series.value?.newReleaseAvailable ?? false),
        nextBookTitle: nextBook?.title ?? series.value?.nextBookTitle,
        nextBookDate: nextBook?.publishedDate ?? series.value?.nextBookDate,
        knownTotal: result.totalBooks ?? series.value?.knownTotal,
      })
      await store.loadSeries()
    }
  } finally {
    checkingNow.value = false
  }
}

async function handleDelete() {
  await deleteSeries(id)
  router.push('/series')
}

const sortedBooks = computed(() =>
  [...seriesBooks.value].sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))
)

const placeholders = computed(() => {
  const total = series.value?.knownTotal ?? 0
  const have = seriesBooks.value.length
  return Math.max(0, total - have)
})

const showDeleteConfirm = ref(false)
</script>

<template>
  <div v-if="series" class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/series" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </RouterLink>
      <div class="flex-1 min-w-0">
        <h1 class="font-serif text-[28px] font-medium text-bone">{{ series.name }}</h1>
        <p class="text-sm text-muted">{{ series.author }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="series.amazonUrl"
          type="button"
          :disabled="checkingNow"
          class="px-3 py-1.5 text-sm border border-white/10 rounded-lg text-muted hover:text-bone hover:bg-ink-800 disabled:opacity-60 transition-colors"
          @click="checkNow"
        >
          {{ checkingNow ? 'Checking…' : 'Check now' }}
        </button>
        <button
          type="button"
          class="text-sm text-brass hover:text-brass-soft"
          @click="editing = !editing"
        >
          {{ editing ? 'Cancel' : 'Edit' }}
        </button>
      </div>
    </div>

    <div v-if="editing" class="bg-ink-850 rounded-xl border hair p-4 space-y-3">
      <h2 class="lbl">Series settings</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="lbl block mb-1">Total books known</label>
          <input
            v-model.number="editData.knownTotal"
            type="number"
            min="0"
            class="field w-full px-3 py-2 rounded-lg text-sm"
          >
        </div>
        <div>
          <label class="lbl block mb-1">Next book title</label>
          <input
            v-model="editData.nextBookTitle"
            type="text"
            class="field w-full px-3 py-2 rounded-lg text-sm"
          >
        </div>
        <div class="col-span-2">
          <label class="lbl block mb-1">Amazon series URL</label>
          <input
            v-model="editData.amazonUrl"
            type="url"
            placeholder="https://www.amazon.de/dp/…"
            class="field w-full px-3 py-2 rounded-lg text-sm"
          >
        </div>
        <div>
          <label class="lbl block mb-1">Next book expected date</label>
          <input
            v-model="editData.nextBookDate"
            type="text"
            placeholder="2025 or 2025-06-01"
            class="field w-full px-3 py-2 rounded-lg text-sm"
          >
        </div>
      </div>
      <button
        type="button"
        class="addbtn px-4 py-2 rounded-lg text-sm font-medium"
        @click="saveEdit"
      >
        Save changes
      </button>
    </div>

    <div class="space-y-2">
      <h2 class="font-semibold text-bone">Books in series</h2>
      <div class="space-y-2">
        <RouterLink
          v-for="book in sortedBooks"
          :key="book.id"
          :to="`/book/${book.id}`"
          class="flex items-center gap-3 p-3 bg-ink-850 rounded-lg border hair hover:bg-ink-800 transition-colors"
        >
          <span class="text-sm font-medium text-faint w-6 text-center flex-shrink-0">
            {{ book.seriesPosition ?? '?' }}
          </span>
          <CoverImage :src="book.coverUrl" :alt="book.title" class="w-10 h-14 flex-shrink-0 rounded" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-bone truncate">{{ book.title }}</p>
            <StatusBadge :status="book.status" />
          </div>
        </RouterLink>

        <div
          v-for="n in placeholders"
          :key="`placeholder-${n}`"
          class="flex items-center gap-3 p-3 bg-ink-800/40 rounded-lg border border-dashed border-white/10 opacity-60"
        >
          <span class="text-sm font-medium text-faint w-6 text-center flex-shrink-0">
            {{ sortedBooks.length + n }}
          </span>
          <div class="w-10 h-14 bg-ink-750 rounded flex-shrink-0" />
          <p class="text-sm text-faint">Unread / upcoming</p>
        </div>
      </div>
    </div>

    <div class="border-t hair pt-4">
      <button
        v-if="!showDeleteConfirm"
        type="button"
        class="text-sm text-red-400 hover:text-red-300"
        @click="showDeleteConfirm = true"
      >
        Delete series
      </button>
      <div v-else class="flex items-center gap-3">
        <p class="text-sm text-muted">Remove "{{ series.name }}" from tracking?</p>
        <button type="button" class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-bone rounded-lg text-sm font-medium" @click="handleDelete">Delete</button>
        <button type="button" class="text-sm text-muted hover:text-bone" @click="showDeleteConfirm = false">Cancel</button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20 text-faint">
    <p>Series not found.</p>
    <RouterLink to="/series" class="mt-2 text-brass hover:text-brass-soft text-sm">← Back to series</RouterLink>
  </div>
</template>
