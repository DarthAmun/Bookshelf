<script setup lang="ts">
import { useExport } from '~/composables/useExport'

const { exportJson, exportHtml } = useExport()

const loadingJson = ref(false)
const loadingHtml = ref(false)

async function handleJson() {
  loadingJson.value = true
  try { await exportJson() } finally { loadingJson.value = false }
}

async function handleHtml() {
  loadingHtml.value = true
  try { await exportHtml() } finally { loadingHtml.value = false }
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <button
      type="button"
      :disabled="loadingJson"
      class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
      @click="handleJson"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {{ loadingJson ? 'Exporting…' : 'Export JSON' }}
    </button>
    <button
      type="button"
      :disabled="loadingHtml"
      class="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
      @click="handleHtml"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      {{ loadingHtml ? 'Generating…' : 'Export reading card (HTML)' }}
    </button>
  </div>
</template>
