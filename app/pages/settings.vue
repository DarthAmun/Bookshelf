<script setup lang="ts">
import { useImport } from '~/composables/useImport'

useHead({ title: 'Settings — Bookshelf' })

const { importJson } = useImport()
const { tags, createTag, updateTag, deleteTag } = useTags()

const importStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const fileInput = ref<HTMLInputElement>()

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const result = await importJson(file)
  importStatus.value = result.success
    ? { type: 'success', message: 'Import successful!' }
    : { type: 'error', message: result.error ?? 'Import failed.' }
  if (fileInput.value) fileInput.value.value = ''
}

const newTagLabel = ref('')
const newTagColor = ref('#6366f1')
const editingTagId = ref<string | null>(null)
const editTagLabel = ref('')
const editTagColor = ref('')

async function handleCreateTag() {
  if (!newTagLabel.value.trim()) return
  await createTag(newTagLabel.value.trim(), newTagColor.value)
  newTagLabel.value = ''
  newTagColor.value = '#6366f1'
}

function startEditTag(tag: { id: string; label: string; color: string }) {
  editingTagId.value = tag.id
  editTagLabel.value = tag.label
  editTagColor.value = tag.color
}

async function saveEditTag() {
  if (!editingTagId.value) return
  await updateTag(editingTagId.value, { label: editTagLabel.value, color: editTagColor.value })
  editingTagId.value = null
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

    <section class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Export</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Back up your library or generate a shareable reading card.</p>
      <ExportButton />
    </section>

    <section class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Import</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Restore a backup. Existing records will be overwritten if IDs match.</p>
      <div>
        <label class="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose JSON file
          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport">
        </label>
      </div>
      <p v-if="importStatus" :class="importStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm">
        {{ importStatus.message }}
      </p>
    </section>

    <section class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Tags</h2>

      <div class="space-y-2">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="flex items-center gap-3"
        >
          <template v-if="editingTagId === tag.id">
            <input
              v-model="editTagLabel"
              type="text"
              class="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <input v-model="editTagColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
            <button type="button" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline" @click="saveEditTag">Save</button>
            <button type="button" class="text-sm text-gray-400 hover:underline" @click="editingTagId = null">Cancel</button>
          </template>
          <template v-else>
            <span class="w-4 h-4 rounded-full flex-shrink-0" :style="{ backgroundColor: tag.color }" />
            <span class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ tag.label }}</span>
            <button type="button" class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="startEditTag(tag)">Edit</button>
            <button type="button" class="text-xs text-red-400 hover:text-red-600" @click="deleteTag(tag.id)">Delete</button>
          </template>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
        <input
          v-model="newTagLabel"
          type="text"
          placeholder="New tag name"
          class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @keydown.enter="handleCreateTag"
        >
        <input v-model="newTagColor" type="color" class="w-9 h-9 rounded cursor-pointer border border-gray-200 dark:border-slate-600">
        <button
          type="button"
          class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          @click="handleCreateTag"
        >
          Add
        </button>
      </div>
    </section>
  </div>
</template>
