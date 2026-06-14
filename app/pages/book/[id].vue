<script setup lang="ts">
import { db } from '~/composables/useDb'
import type { Book, Review, Series, Tag } from '~/composables/useDb'

const route = useRoute()
const id = route.params.id as string

const book = useLiveQuery(() => db.books.get(id), undefined)
const review = useLiveQuery(() => db.reviews.where('bookId').equals(id).first(), undefined)
const bookTags = useLiveQuery(async () => {
  const bts = await db.bookTags.where('bookId').equals(id).toArray()
  return db.tags.where('id').anyOf(bts.map(bt => bt.tagId)).toArray()
}, [] as Tag[])
const series = useLiveQuery(async () => {
  if (!book.value?.seriesId) return undefined
  return db.series.get(book.value.seriesId)
}, undefined)
const allTags = useLiveQuery(() => db.tags.orderBy('label').toArray(), [])

useHead(() => ({ title: book.value ? `${book.value.title} — Bookshelf` : 'Book — Bookshelf' }))

const { updateBook, deleteBook } = useBooks()
const { addReview, updateReview } = useReviews()
const { addTagToBook, removeTagFromBook } = useTags()

const reviewForm = ref<Partial<Review>>({})
const showDeleteConfirm = ref(false)
const saving = ref(false)

watch(() => review.value, (r) => {
  if (r) reviewForm.value = { ...r }
}, { immediate: true })

async function saveReview() {
  if (!book.value) return
  saving.value = true
  try {
    const data = {
      bookId: id,
      rating: reviewForm.value.rating,
      reviewText: reviewForm.value.reviewText,
      containsSpoilers: reviewForm.value.containsSpoilers ?? false,
      dateRead: reviewForm.value.dateRead,
    }
    await addReview(data)
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  await deleteBook(id)
  await navigateTo('/')
}

async function handleStatusChange(status: Book['status']) {
  await updateBook(id, { status })
}

async function handleAddTag(tagId: string) {
  await addTagToBook(id, tagId)
}

async function handleRemoveTag(tagId: string) {
  await removeTagFromBook(id, tagId)
}

const availableTags = computed(() => {
  const existing = new Set(bookTags.value.map(t => t.id))
  return allTags.value.filter(t => !existing.has(t.id))
})

function formatDate(ts: number | undefined): string {
  if (!ts) return ''
  return new Date(ts).toISOString().split('T')[0]
}

function parseDateInput(val: string): number | undefined {
  if (!val) return undefined
  return new Date(val).getTime()
}
</script>

<template>
  <div v-if="book" class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <nav class="text-sm text-gray-500 dark:text-gray-400">
        <NuxtLink v-if="series" :to="`/series/${series.id}`" class="hover:underline">{{ series.name }}</NuxtLink>
        <span v-if="series && book.seriesPosition"> #{{ book.seriesPosition }}</span>
      </nav>
    </div>

    <div class="flex gap-6">
      <CoverImage :src="book.coverUrl" :alt="book.title" class="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden" />
      <div class="flex-1 min-w-0 space-y-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ book.title }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-0.5">{{ book.author }}</p>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <select
            :value="book.status"
            class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @change="handleStatusChange(($event.target as HTMLSelectElement).value as Book['status'])"
          >
            <option value="want_to_read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <StatusBadge :status="book.status" />
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
          <p v-if="book.genre">{{ book.genre }}</p>
          <p v-if="book.publishedDate">
            {{ book.publishedDate.length === 4 ? `Expected ~${book.publishedDate}` : book.publishedDate }}
          </p>
          <p v-if="book.pageCount">{{ book.pageCount }} pages</p>
        </div>
        <a
          v-if="book.amazonUrl"
          :href="book.amazonUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View on Amazon ↗
        </a>
      </div>
    </div>

    <div v-if="book.description" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">
      {{ book.description }}
    </div>

    <div class="border-t border-gray-100 dark:border-slate-700 pt-6 space-y-4">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Review</h2>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating (1–10)</label>
        <RatingInput v-model="reviewForm.rating" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date read</label>
        <input
          :value="formatDate(reviewForm.dateRead)"
          type="date"
          class="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @change="reviewForm.dateRead = parseDateInput(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
        <textarea
          v-model="reviewForm.reviewText"
          rows="4"
          placeholder="What did you think?"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <label class="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
          <input v-model="reviewForm.containsSpoilers" type="checkbox" class="rounded">
          Contains spoilers
        </label>
      </div>
      <button
        type="button"
        :disabled="saving"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
        @click="saveReview"
      >
        {{ saving ? 'Saving…' : 'Save review' }}
      </button>
    </div>

    <div class="border-t border-gray-100 dark:border-slate-700 pt-6 space-y-3">
      <h2 class="font-semibold text-gray-900 dark:text-gray-100">Tags</h2>
      <div class="flex flex-wrap gap-2">
        <TagChip
          v-for="tag in bookTags"
          :key="tag.id"
          :tag="tag"
          removable
          @remove="handleRemoveTag(tag.id)"
        />
        <select
          v-if="availableTags.length"
          class="px-2 py-1 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @change="handleAddTag(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''"
        >
          <option value="">+ Add tag</option>
          <option v-for="t in availableTags" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </div>
    </div>

    <div class="border-t border-gray-100 dark:border-slate-700 pt-6">
      <button
        v-if="!showDeleteConfirm"
        type="button"
        class="text-sm text-red-600 dark:text-red-400 hover:underline"
        @click="showDeleteConfirm = true"
      >
        Delete book
      </button>
      <div v-else class="flex items-center gap-3">
        <p class="text-sm text-gray-600 dark:text-gray-300">Remove "{{ book.title }}" from your library?</p>
        <button
          type="button"
          class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          @click="handleDelete"
        >
          Delete
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:underline"
          @click="showDeleteConfirm = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20 text-gray-400">
    <p>Book not found.</p>
    <NuxtLink to="/" class="mt-2 text-indigo-600 hover:underline text-sm">← Back to library</NuxtLink>
  </div>
</template>
