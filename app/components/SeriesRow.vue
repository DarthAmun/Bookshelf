<script setup lang="ts">
import type { Series } from '~/composables/useDb'

defineProps<{ series: Series; progress: { read: number; total: number } }>()

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return ''
  if (dateStr.length === 4) return `~${dateStr}`
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}
</script>

<template>
  <NuxtLink
    :to="`/series/${series.id}`"
    class="flex items-center justify-between gap-4 p-4 bg-ink-850 rounded-xl border hair hover:bg-ink-800 transition-colors"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-bone truncate">{{ series.name }}</h3>
        <span
          v-if="series.newReleaseAvailable"
          class="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brass/20 text-brass"
        >
          New!
        </span>
      </div>
      <p class="text-sm text-muted">{{ series.author }}</p>
      <div v-if="series.newReleaseAvailable && series.nextBookTitle" class="mt-1 text-xs text-brass">
        "{{ series.nextBookTitle }}"
        <span v-if="series.nextBookDate">({{ formatDate(series.nextBookDate) }})</span>
      </div>
    </div>
    <div class="flex-shrink-0 text-sm font-medium text-muted">
      {{ progress.read }} / {{ progress.total }} read
    </div>
  </NuxtLink>
</template>
