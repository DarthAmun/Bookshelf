<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLibraryStore } from '../../stores/library'
import { storeToRefs } from 'pinia'
import type { Series } from '~/types'

useHead({ title: 'Series — Bookshelf' })

const { addSeries, seriesList } = useSeries()
const store = useLibraryStore()
const { series, books } = storeToRefs(store)

const seriesWithNew = computed(() => series.value.filter(s => s.newReleaseAvailable))

const progresses = ref<Record<string, { read: number; total: number }>>({})

watch(seriesList, async (list) => {
  const { getSeriesProgress } = useSeries()
  for (const s of list) {
    progresses.value[s.id] = await getSeriesProgress(s.id)
  }
}, { immediate: true, deep: true })

const refreshing = ref(false)
async function refreshAll() {
  refreshing.value = true
  try {
    await window.bookshelf.checkAllSeries()
    await store.refresh()
  } finally {
    refreshing.value = false
  }
}

const showAddForm = ref(false)
const newSeries = ref<Partial<Series>>({ newReleaseAvailable: false })

async function handleAddSeries() {
  if (!newSeries.value.name || !newSeries.value.author) return
  await addSeries({
    ...newSeries.value,
    name: newSeries.value.name!,
    author: newSeries.value.author!,
    newReleaseAvailable: false,
  })
  showAddForm.value = false
  newSeries.value = { newReleaseAvailable: false }
}

// --- Upcoming releases ---

const upcomingBooks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  return books.value
    .map(b => ({ book: b, date: b.publishedDate ? new Date(b.publishedDate) : null }))
    .filter(({ date }) => date !== null && !isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map(({ book, date }) => ({
      book,
      date: date!,
      series: series.value.find(s => s.id === book.seriesId),
      daysUntil: Math.ceil((date!.getTime() - todayMs) / 86400000),
    }))
})

function formatUpcomingDate(d: Date): string {
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-[28px] font-medium text-bone">Series</h1>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="refreshing"
          class="px-3 py-1.5 text-sm text-muted border border-white/10 rounded-lg hover:bg-ink-800 disabled:opacity-60 transition-colors"
          @click="refreshAll"
        >
          {{ refreshing ? 'Checking…' : 'Refresh all' }}
        </button>
        <RouterLink
          to="/series/add"
          class="addbtn px-3 py-1.5 text-sm rounded-lg font-medium"
        >
          + Import series
        </RouterLink>
        <button
          type="button"
          class="px-3 py-1.5 text-sm rounded-lg font-medium border border-white/10 text-muted hover:text-bone hover:bg-ink-800 transition-colors"
          @click="showAddForm = !showAddForm"
        >
          + Add manually
        </button>
      </div>
    </div>

    <NewReleaseBanner :series="seriesWithNew" />

    <!-- Upcoming releases -->
    <div v-if="upcomingBooks.length" class="space-y-3">
      <h2 class="font-serif text-[18px] font-medium text-bone">Upcoming</h2>
      <div class="space-y-2">
        <a
          v-for="item in upcomingBooks"
          :key="item.book.id"
          :href="item.book.amazonUrl"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 p-3 bg-ink-850 rounded-xl border hair hover:bg-ink-800 transition-colors"
          :class="item.book.amazonUrl ? '' : 'cursor-default pointer-events-none'"
        >
          <CoverImage :src="item.book.coverUrl" :alt="item.book.title" class="w-9 h-[54px] flex-shrink-0 rounded" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-bone truncate">{{ item.book.title }}</p>
            <p class="text-xs text-muted">
              {{ item.series?.name ?? item.book.author }}
              <span v-if="item.book.seriesPosition"> · #{{ item.book.seriesPosition }}</span>
            </p>
          </div>
          <div class="flex-shrink-0 text-right">
            <p class="text-xs font-medium text-brass">{{ formatUpcomingDate(item.date) }}</p>
            <p class="text-[10px] text-faint mt-0.5">
              {{ item.daysUntil === 0 ? 'Today' : `in ${item.daysUntil} days` }}
            </p>
          </div>
        </a>
      </div>
    </div>

    <div v-if="showAddForm" class="bg-ink-850 rounded-xl border hair p-4 space-y-3">
      <h2 class="font-semibold text-bone">Add new series</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          v-model="newSeries.name"
          type="text"
          placeholder="Series name"
          class="field px-3 py-2 rounded-lg text-sm"
        >
        <input
          v-model="newSeries.author"
          type="text"
          placeholder="Author"
          class="field px-3 py-2 rounded-lg text-sm"
        >
        <input
          v-model="newSeries.amazonUrl"
          type="url"
          placeholder="Amazon series URL (optional)"
          class="field px-3 py-2 rounded-lg text-sm col-span-2"
        >
        <input
          v-model.number="newSeries.knownTotal"
          type="number"
          min="1"
          placeholder="Total books (optional)"
          class="field px-3 py-2 rounded-lg text-sm"
        >
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="addbtn px-4 py-2 rounded-lg text-sm font-medium"
          @click="handleAddSeries"
        >
          Save
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm text-muted hover:text-bone"
          @click="showAddForm = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <div>
      <h2 v-if="upcomingBooks.length" class="font-serif text-[18px] font-medium text-bone mb-3">All series</h2>
      <div v-if="seriesList.length" class="space-y-3">
        <SeriesRow
          v-for="s in seriesList"
          :key="s.id"
          :series="s"
          :progress="progresses[s.id] ?? { read: 0, total: 0 }"
        />
      </div>
      <div v-else class="text-center py-20 text-faint">
        <p>No series tracked yet.</p>
      </div>
    </div>
  </div>
</template>
