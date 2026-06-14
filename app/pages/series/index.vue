<script setup lang="ts">
import { db } from '~/composables/useDb'
import type { Series } from '~/composables/useDb'
import { checkAllSeries } from '~/services/seriesChecker'

useHead({ title: 'Series — Bookshelf' })

const { addSeries, seriesList } = useSeries()
const seriesWithNew = useLiveQuery(
  () => db.series.filter(s => s.newReleaseAvailable).toArray(),
  []
)

const progresses = ref<Record<string, { read: number; total: number }>>({})

watch(() => seriesList.value, async (list) => {
  const { getSeriesProgress } = useSeries()
  for (const s of list) {
    progresses.value[s.id] = await getSeriesProgress(s.id)
  }
}, { immediate: true, deep: true })

const { public: { googleBooksApiKey } } = useRuntimeConfig()

const refreshing = ref(false)
async function refreshAll() {
  refreshing.value = true
  try { await checkAllSeries(googleBooksApiKey) } finally { refreshing.value = false }
}

const showAddForm = ref(false)
const newSeries = ref<Partial<Series>>({ newReleaseAvailable: false })

async function handleAddSeries() {
  if (!newSeries.value.name || !newSeries.value.author) return
  await addSeries({ ...newSeries.value, name: newSeries.value.name!, author: newSeries.value.author!, newReleaseAvailable: false })
  showAddForm.value = false
  newSeries.value = { newReleaseAvailable: false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Series</h1>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="refreshing"
          class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
          @click="refreshAll"
        >
          {{ refreshing ? 'Checking…' : 'Refresh all' }}
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          @click="showAddForm = !showAddForm"
        >
          + Add series
        </button>
      </div>
    </div>

    <NewReleaseBanner :series="seriesWithNew" />

    <div v-if="showAddForm" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Add new series</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          v-model="newSeries.name"
          type="text"
          placeholder="Series name"
          class="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        <input
          v-model="newSeries.author"
          type="text"
          placeholder="Author"
          class="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        <input
          v-model="newSeries.googleBooksQueryName"
          type="text"
          placeholder="Google Books query name (optional)"
          class="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        <input
          v-model.number="newSeries.knownTotal"
          type="number"
          min="1"
          placeholder="Total books (optional)"
          class="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          @click="handleAddSeries"
        >
          Save
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:underline"
          @click="showAddForm = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <div v-if="seriesList.length" class="space-y-3">
      <SeriesRow
        v-for="s in seriesList"
        :key="s.id"
        :series="s"
        :progress="progresses[s.id] ?? { read: 0, total: 0 }"
      />
    </div>
    <div v-else class="text-center py-20 text-gray-400 dark:text-gray-500">
      <p>No series tracked yet.</p>
    </div>
  </div>
</template>
