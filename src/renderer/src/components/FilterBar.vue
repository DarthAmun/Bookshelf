<script setup lang="ts">
import type { Book } from '~/types'
import { useLibrary } from '~/composables/useLibrary'

export interface FilterState {
  status: Book['status'] | 'all'
  genre: string
  seriesId: string
  tagId: string
  sort: 'dateAdded' | 'title' | 'author' | 'rating' | 'dateRead'
  search: string
}

const props = defineProps<{ modelValue: FilterState }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: FilterState): void }>()

const { books: allBooks } = useLibrary()

const genres = computed(() =>
  [...new Set(allBooks.value.map(b => b.genre).filter(Boolean) as string[])].sort()
)

const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: allBooks.value.length }
  allBooks.value.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1 })
  return counts
})

const statuses: Array<{ value: FilterState['status']; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'want_to_read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'abandoned', label: 'Abandoned' },
]

function update(partial: Partial<FilterState>) {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}
</script>

<template>
  <div class="border-b hair pb-3.5">
    <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
      <!-- status tabs -->
      <nav class="flex items-center gap-5 font-sans text-[13.5px] font-medium whitespace-nowrap">
        <button
          v-for="s in statuses"
          :key="s.value"
          type="button"
          class="tab"
          :class="{ active: modelValue.status === s.value }"
          @click="update({ status: s.value })"
        >
          {{ s.label }}
          <span v-if="s.value === 'all'" class="ml-1 font-mono text-[10px] text-faint">
            {{ statusCounts.all ?? 0 }}
          </span>
        </button>
      </nav>

      <!-- search + genre -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8"
          >
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
          </svg>
          <input
            :value="modelValue.search"
            type="text"
            placeholder="Search titles, authors…"
            class="field w-[200px] rounded-md py-2 pl-9 pr-3 font-sans text-[13px]"
            @input="update({ search: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <select
          v-if="genres.length"
          :value="modelValue.genre"
          class="field cursor-pointer rounded-md py-2 pl-3 pr-7 font-sans text-[13px] text-muted"
          @change="update({ genre: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">All genres</option>
          <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
