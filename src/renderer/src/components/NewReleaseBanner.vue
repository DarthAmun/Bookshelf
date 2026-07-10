<script setup lang="ts">
import type { Series } from '~/types'

const props = defineProps<{ series: Series[] }>()

const dismissed = reactive(new Set<string>())
const visible = computed(() => props.series.filter(s => s.newReleaseAvailable && !dismissed.has(s.id)))

function dismiss(id: string) {
  dismissed.add(id)
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return ''
  if (dateStr.length === 4) return `expected ~${dateStr}`
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}
</script>

<template>
  <div v-if="visible.length" class="space-y-2.5">
    <div
      v-for="s in visible"
      :key="s.id"
      class="group flex items-center gap-4 rounded-md border hair bg-ink-850/60 px-5 py-4 transition hover:border-brass/40 hover:bg-ink-800/70"
    >
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/12 ring-1 ring-brass/30">
        <span class="h-2 w-2 rounded-full bg-brass" style="box-shadow:0 0 10px rgba(196,164,104,.8)"></span>
      </span>

      <div class="min-w-0 flex-1">
        <div class="font-mono text-[10px] uppercase tracking-[.18em] text-brass/80">New in the series · awaiting release</div>
        <div class="mt-0.5 truncate font-serif text-[16px] text-bone">
          <span v-if="s.nextBookTitle" class="italic">{{ s.nextBookTitle }}</span>
          <span v-else>New book</span>
          — {{ s.name }}
          <span v-if="s.nextBookDate" class="text-muted"> · {{ formatDate(s.nextBookDate) }}</span>
        </div>
      </div>

      <div class="hidden shrink-0 items-center gap-2 sm:flex">
        <a
          :href="`https://www.amazon.com/s?k=${encodeURIComponent(s.name + ' ' + s.author)}`"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-md border border-brass/40 bg-brass/10 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-brass-soft transition hover:bg-brass/20"
        >
          Check on Amazon
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17 17 7M9 7h8v8"/>
          </svg>
        </a>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-md text-faint hover:text-muted transition-colors"
          @click="dismiss(s.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
