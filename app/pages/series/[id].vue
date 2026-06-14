<script setup lang="ts">
import { db } from '~/composables/useDb'
import type { Book } from '~/composables/useDb'

const route = useRoute()
const id = route.params.id as string

const series = useLiveQuery(() => db.series.get(id), undefined)
const seriesBooks = useLiveQuery(
  () => db.books.where('seriesId').equals(id).toArray(),
  [] as Book[]
)

useHead(() => ({ title: series.value ? `${series.value.name} — Bookshelf` : 'Series — Bookshelf' }))

const { updateSeries, deleteSeries } = useSeries()

const editing = ref(false)
const editData = ref<{
  knownTotal?: number
  googleBooksQueryName?: string
  nextBookTitle?: string
  nextBookDate?: string
}>({})

watch(() => series.value, (s) => {
  if (s) {
    editData.value = {
      knownTotal: s.knownTotal,
      googleBooksQueryName: s.googleBooksQueryName,
      nextBookTitle: s.nextBookTitle,
      nextBookDate: s.nextBookDate,
    }
  }
}, { immediate: true })

async function saveEdit() {
  await updateSeries(id, editData.value)
  editing.value = false
}

async function handleDelete() {
  await deleteSeries(id)
  await navigateTo('/series')
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
      <NuxtLink to="/series" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ series.name }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ series.author }}</p>
      </div>
      <button
        type="button"
        class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        @click="editing = !editing"
      >
        {{ editing ? 'Cancel' : 'Edit' }}
      </button>
    </div>

    <div v-if="editing" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
      <h2 class="font-semibold text-sm text-gray-700 dark:text-gray-300">Series settings</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total books known</label>
          <input
            v-model.number="editData.knownTotal"
            type="number"
            min="0"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Google Books query name</label>
          <input
            v-model="editData.googleBooksQueryName"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next book title</label>
          <input
            v-model="editData.nextBookTitle"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next book expected date</label>
          <input
            v-model="editData.nextBookDate"
            type="text"
            placeholder="2025 or 2025-06-01"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>
      </div>
      <button
        type="button"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        @click="saveEdit"
      >
        Save changes
      </button>
    </div>

    <div class="space-y-2">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Books in series</h2>
      <div class="space-y-2">
        <NuxtLink
          v-for="book in sortedBooks"
          :key="book.id"
          :to="`/book/${book.id}`"
          class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow"
        >
          <span class="text-sm font-medium text-gray-400 dark:text-gray-500 w-6 text-center flex-shrink-0">
            {{ book.seriesPosition ?? '?' }}
          </span>
          <CoverImage :src="book.coverUrl" :alt="book.title" class="w-10 h-14 flex-shrink-0 rounded" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{{ book.title }}</p>
            <StatusBadge :status="book.status" />
          </div>
        </NuxtLink>

        <div
          v-for="n in placeholders"
          :key="`placeholder-${n}`"
          class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-600 opacity-60"
        >
          <span class="text-sm font-medium text-gray-400 dark:text-gray-500 w-6 text-center flex-shrink-0">
            {{ sortedBooks.length + n }}
          </span>
          <div class="w-10 h-14 bg-gray-200 dark:bg-slate-700 rounded flex-shrink-0" />
          <p class="text-sm text-gray-400 dark:text-gray-500">Unread / upcoming</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-100 dark:border-slate-700 pt-4">
      <button
        v-if="!showDeleteConfirm"
        type="button"
        class="text-sm text-red-600 dark:text-red-400 hover:underline"
        @click="showDeleteConfirm = true"
      >
        Delete series
      </button>
      <div v-else class="flex items-center gap-3">
        <p class="text-sm text-gray-600 dark:text-gray-300">Remove "{{ series.name }}" from tracking?</p>
        <button type="button" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium" @click="handleDelete">Delete</button>
        <button type="button" class="text-sm text-gray-600 dark:text-gray-300 hover:underline" @click="showDeleteConfirm = false">Cancel</button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20 text-gray-400">
    <p>Series not found.</p>
    <NuxtLink to="/series" class="mt-2 text-indigo-600 hover:underline text-sm">← Back to series</NuxtLink>
  </div>
</template>
