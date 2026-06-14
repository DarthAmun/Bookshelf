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
      <NuxtLink to="/series" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h1 class="font-serif text-[28px] font-medium text-bone">{{ series.name }}</h1>
        <p class="text-sm text-muted">{{ series.author }}</p>
      </div>
      <button
        type="button"
        class="text-sm text-brass hover:text-brass-soft"
        @click="editing = !editing"
      >
        {{ editing ? 'Cancel' : 'Edit' }}
      </button>
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
          <label class="lbl block mb-1">Google Books query name</label>
          <input
            v-model="editData.googleBooksQueryName"
            type="text"
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
        <NuxtLink
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
        </NuxtLink>

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
    <NuxtLink to="/series" class="mt-2 text-brass hover:text-brass-soft text-sm">← Back to series</NuxtLink>
  </div>
</template>
