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
    class="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ series.name }}</h3>
        <span
          v-if="series.newReleaseAvailable"
          class="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
        >
          New!
        </span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ series.author }}</p>
      <div v-if="series.newReleaseAvailable && series.nextBookTitle" class="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
        "{{ series.nextBookTitle }}"
        <span v-if="series.nextBookDate">({{ formatDate(series.nextBookDate) }})</span>
      </div>
    </div>
    <div class="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-300">
      {{ progress.read }} / {{ progress.total }} read
    </div>
  </NuxtLink>
</template>
