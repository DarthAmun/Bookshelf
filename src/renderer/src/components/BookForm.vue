<script setup lang="ts">
import { computed } from 'vue'
import { useLibraryStore } from '../stores/library'
import type { Book } from '~/types'

const props = defineProps<{ modelValue: Partial<Book> }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Partial<Book>): void
  (e: 'submit'): void
}>()

const store = useLibraryStore()
const seriesList = computed(() => [...store.series].sort((a, b) => a.name.localeCompare(b.name)))

function update(key: keyof Book, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const statuses: Array<{ value: Book['status']; label: string }> = [
  { value: 'want_to_read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'abandoned', label: 'Abandoned' },
]
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="lbl block mb-1">Title *</label>
        <input
          :value="modelValue.title"
          type="text"
          required
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('title', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="lbl block mb-1">Author *</label>
        <input
          :value="modelValue.author"
          type="text"
          required
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('author', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <div>
      <label class="lbl block mb-1">Status</label>
      <select
        :value="modelValue.status ?? 'want_to_read'"
        class="w-full field px-3 py-2 rounded-lg text-sm"
        @change="update('status', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="lbl block mb-1">Series</label>
        <select
          :value="modelValue.seriesId ?? ''"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @change="update('seriesId', ($event.target as HTMLSelectElement).value || undefined)"
        >
          <option value="">None</option>
          <option v-for="s in seriesList" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="lbl block mb-1">Position in series</label>
        <input
          :value="modelValue.seriesPosition"
          type="number"
          min="1"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('seriesPosition', Number(($event.target as HTMLInputElement).value) || undefined)"
        >
      </div>
    </div>

    <div>
      <label class="lbl block mb-1">Cover URL</label>
      <input
        :value="modelValue.coverUrl"
        type="url"
        class="w-full field px-3 py-2 rounded-lg text-sm"
        @input="update('coverUrl', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="lbl block mb-1">Genre</label>
        <input
          :value="modelValue.genre"
          type="text"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('genre', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="lbl block mb-1">Published date</label>
        <input
          :value="modelValue.publishedDate"
          type="text"
          placeholder="2023 or 2023-06-01"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('publishedDate', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="lbl block mb-1">Publisher</label>
        <input
          :value="modelValue.publisher"
          type="text"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('publisher', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="lbl block mb-1">Page count</label>
        <input
          :value="modelValue.pageCount"
          type="number"
          min="1"
          class="w-full field px-3 py-2 rounded-lg text-sm"
          @input="update('pageCount', Number(($event.target as HTMLInputElement).value) || undefined)"
        >
      </div>
    </div>

    <div>
      <label class="lbl block mb-1">Amazon URL</label>
      <input
        :value="modelValue.amazonUrl"
        type="url"
        class="w-full field px-3 py-2 rounded-lg text-sm"
        @input="update('amazonUrl', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div>
      <label class="lbl block mb-1">Description</label>
      <textarea
        :value="modelValue.description"
        rows="3"
        class="w-full field px-3 py-2 rounded-lg text-sm resize-none"
        @input="update('description', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <slot name="actions">
      <button type="submit" class="addbtn w-full py-2.5 px-4 rounded-lg font-medium text-sm">
        Save to library
      </button>
    </slot>
  </form>
</template>
