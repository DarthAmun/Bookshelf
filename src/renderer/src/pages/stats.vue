<script setup lang="ts">
import { computed } from 'vue'
import { useLibraryStore } from '../stores/library'
import { storeToRefs } from 'pinia'

useHead({ title: 'Stats — Bookshelf' })

const store = useLibraryStore()
const { books, reviews, series } = storeToRefs(store)

const currentYear = new Date().getFullYear()

const booksRead = computed(() => books.value.filter(b => b.status === 'read').length)
const booksThisYear = computed(() =>
  reviews.value.filter(r => r.dateRead && new Date(r.dateRead).getFullYear() === currentYear).length
)

const avgRating = computed(() => {
  const rated = reviews.value.filter(r => r.rating)
  if (!rated.length) return null
  return (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)
})

const topBooks = computed(() =>
  reviews.value
    .filter(r => r.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)
    .map(r => ({ book: books.value.find(b => b.id === r.bookId), rating: r.rating }))
    .filter(x => x.book)
)

const monthlyPace = computed(() => {
  const map: Record<string, number> = {}
  reviews.value.forEach(r => {
    if (!r.dateRead) return
    const d = new Date(r.dateRead)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = (map[key] ?? 0) + 1
  })
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), value: map[key] ?? 0 }
  })
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

const seriesCompletion = computed(() =>
  series.value
    .filter(s => s.knownTotal && s.knownTotal > 0)
    .map(s => {
      const read = books.value.filter(b => b.seriesId === s.id && b.status === 'read').length
      return { label: s.name, value: Math.round((read / (s.knownTotal ?? 1)) * 100) }
    })
    .sort((a, b) => b.value - a.value)
)
</script>

<template>
  <div class="space-y-8 max-w-3xl mx-auto">
    <h1 class="font-serif text-[28px] font-medium text-bone">Reading stats</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-ink-850 rounded-xl border hair p-4 text-center">
        <div class="text-3xl font-bold text-brass">{{ booksRead }}</div>
        <div class="text-xs text-faint mt-1">Books read (all time)</div>
      </div>
      <div class="bg-ink-850 rounded-xl border hair p-4 text-center">
        <div class="text-3xl font-bold text-brass">{{ booksThisYear }}</div>
        <div class="text-xs text-faint mt-1">Books read this year</div>
      </div>
      <div class="bg-ink-850 rounded-xl border hair p-4 text-center">
        <div class="text-3xl font-bold text-brass-soft">{{ avgRating ?? '—' }}</div>
        <div class="text-xs text-faint mt-1">Avg rating</div>
      </div>
      <div class="bg-ink-850 rounded-xl border hair p-4 text-center">
        <div class="text-3xl font-bold text-brass">{{ books.length }}</div>
        <div class="text-xs text-faint mt-1">Total in library</div>
      </div>
    </div>

    <div class="bg-ink-850 rounded-xl border hair p-5 space-y-3">
      <h2 class="font-semibold text-bone">Books per month (last 12 months)</h2>
      <StatsChart :data="monthlyPace" type="bar" />
    </div>

    <div v-if="genreBreakdown.length" class="bg-ink-850 rounded-xl border hair p-5 space-y-3">
      <h2 class="font-semibold text-bone">Genre breakdown</h2>
      <StatsChart :data="genreBreakdown" type="horizontal-bar" />
    </div>

    <div v-if="topBooks.length" class="bg-ink-850 rounded-xl border hair p-5 space-y-3">
      <h2 class="font-semibold text-bone">Top 5 rated</h2>
      <ol class="space-y-2">
        <li v-for="(item, i) in topBooks" :key="i" class="flex items-center gap-3">
          <span class="text-sm font-bold text-faint w-4">{{ i + 1 }}</span>
          <RouterLink :to="`/book/${item.book!.id}`" class="flex-1 text-sm text-bone hover:underline truncate">
            {{ item.book!.title }}
          </RouterLink>
          <RatingDisplay :rating="item.rating" size="sm" />
        </li>
      </ol>
    </div>

    <div v-if="seriesCompletion.length" class="bg-ink-850 rounded-xl border hair p-5 space-y-3">
      <h2 class="font-semibold text-bone">Series completion</h2>
      <StatsChart :data="seriesCompletion" type="horizontal-bar" />
      <p class="text-xs text-faint">Showing % of known total read</p>
    </div>
  </div>
</template>
