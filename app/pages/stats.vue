<script setup lang="ts">
import { db } from '~/composables/useDb'

useHead({ title: 'Stats — Bookshelf' })

const books = useLiveQuery(() => db.books.toArray(), [])
const reviews = useLiveQuery(() => db.reviews.toArray(), [])
const series = useLiveQuery(() => db.series.toArray(), [])

const currentYear = new Date().getFullYear()

const booksRead = computed(() => books.value.filter(b => b.status === 'read').length)
const booksThisYear = computed(() => {
  return reviews.value.filter(r => {
    if (!r.dateRead) return false
    return new Date(r.dateRead).getFullYear() === currentYear
  }).length
})

const avgRating = computed(() => {
  const rated = reviews.value.filter(r => r.rating)
  if (!rated.length) return null
  return (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)
})

const topBooks = computed(() => {
  return reviews.value
    .filter(r => r.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)
    .map(r => {
      const book = books.value.find(b => b.id === r.bookId)
      return { book, rating: r.rating }
    })
    .filter(x => x.book)
})

const monthlyPace = computed(() => {
  const map: Record<string, number> = {}
  reviews.value.forEach(r => {
    if (!r.dateRead) return
    const d = new Date(r.dateRead)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = (map[key] ?? 0) + 1
  })
  const months: Array<{ label: string; value: number }> = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), value: map[key] ?? 0 })
  }
  return months
})

const genreBreakdown = computed(() => {
  const map: Record<string, number> = {}
  books.value.forEach(b => {
    if (!b.genre) return
    map[b.genre] = (map[b.genre] ?? 0) + 1
  })
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }))
})

const seriesCompletion = computed(() => {
  return series.value
    .filter(s => s.knownTotal && s.knownTotal > 0)
    .map(s => {
      const read = books.value.filter(b => b.seriesId === s.id && b.status === 'read').length
      const pct = Math.round((read / (s.knownTotal ?? 1)) * 100)
      return { label: s.name, value: pct }
    })
    .sort((a, b) => b.value - a.value)
})
</script>

<template>
  <div class="space-y-8 max-w-3xl mx-auto">
    <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Reading stats</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ booksRead }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Books read (all time)</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ booksThisYear }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Books read this year</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
        <div class="text-3xl font-bold text-amber-500">{{ avgRating ?? '—' }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg rating</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ books.length }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total in library</div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Books per month (last 12 months)</h2>
      <StatsChart :data="monthlyPace" type="bar" />
    </div>

    <div v-if="genreBreakdown.length" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Genre breakdown</h2>
      <StatsChart :data="genreBreakdown" type="horizontal-bar" />
    </div>

    <div v-if="topBooks.length" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Top 5 rated</h2>
      <ol class="space-y-2">
        <li v-for="(item, i) in topBooks" :key="i" class="flex items-center gap-3">
          <span class="text-sm font-bold text-gray-400 dark:text-gray-500 w-4">{{ i + 1 }}</span>
          <NuxtLink :to="`/book/${item.book!.id}`" class="flex-1 text-sm text-gray-900 dark:text-gray-100 hover:underline truncate">
            {{ item.book!.title }}
          </NuxtLink>
          <RatingDisplay :rating="item.rating" size="sm" />
        </li>
      </ol>
    </div>

    <div v-if="seriesCompletion.length" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Series completion</h2>
      <StatsChart :data="seriesCompletion" type="horizontal-bar" />
      <p class="text-xs text-gray-400 dark:text-gray-500">Showing % of known total read</p>
    </div>
  </div>
</template>
