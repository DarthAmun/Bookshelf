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
const editing = ref(false)
const editData = ref<Partial<Book>>({})

watch(() => review.value, (r) => {
  if (r) reviewForm.value = { ...r }
}, { immediate: true })

function startEdit() {
  if (!book.value) return
  const { coverUrl, ...rest } = book.value
  editData.value = { ...rest, coverUrl: coverUrl?.startsWith('data:') ? undefined : coverUrl }
  editing.value = true
}

async function saveEdit() {
  const changes = { ...editData.value }
  // preserve a file-upload cover (data URL) if the user didn't change the cover field
  if (!changes.coverUrl && book.value?.coverUrl?.startsWith('data:')) {
    changes.coverUrl = book.value.coverUrl
  }
  await updateBook(id, changes)
  editing.value = false
}

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
      <NuxtLink to="/" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <nav class="text-sm text-muted">
        <NuxtLink v-if="series" :to="`/series/${series.id}`" class="hover:underline">{{ series.name }}</NuxtLink>
        <span v-if="series && book.seriesPosition"> #{{ book.seriesPosition }}</span>
      </nav>
    </div>

    <div class="flex gap-6">
      <CoverImage :src="book.coverUrl" :alt="book.title" class="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden" />
      <div class="flex-1 min-w-0 space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h1 class="font-serif text-2xl font-medium text-bone">{{ book.title }}</h1>
            <p class="text-muted mt-0.5">{{ book.author }}</p>
          </div>
          <button type="button" class="flex-shrink-0 text-sm text-brass hover:text-brass-soft" @click="startEdit">
            Edit
          </button>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <select
            :value="book.status"
            class="field px-3 py-1.5 rounded-lg text-sm"
            @change="handleStatusChange(($event.target as HTMLSelectElement).value as Book['status'])"
          >
            <option value="want_to_read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <StatusBadge :status="book.status" />
        </div>
        <div class="text-sm text-muted space-y-0.5">
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
          class="inline-flex items-center gap-1 text-sm text-brass hover:text-brass-soft"
        >
          View on Amazon ↗
        </a>
      </div>
    </div>

    <div v-if="book.description && !editing" class="text-sm text-muted leading-relaxed line-clamp-4">
      {{ book.description }}
    </div>

    <div v-if="editing" class="bg-ink-850 rounded-xl border hair p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-bone">Edit details</h2>
        <button type="button" class="text-sm text-faint hover:text-muted" @click="editing = false">Cancel</button>
      </div>
      <BookForm v-model="editData" @submit="saveEdit">
        <template #actions>
          <button type="submit" class="addbtn px-4 py-2 rounded-lg text-sm font-medium">
            Save changes
          </button>
        </template>
      </BookForm>
    </div>

    <div class="border-t hair pt-6 space-y-4">
      <h2 class="font-semibold text-bone">Review</h2>
      <div>
        <label class="lbl block mb-2">Rating (1–10)</label>
        <RatingInput v-model="reviewForm.rating" />
      </div>
      <div>
        <label class="lbl block mb-1">Date read</label>
        <input
          :value="formatDate(reviewForm.dateRead)"
          type="date"
          class="field px-3 py-2 rounded-lg text-sm"
          @change="reviewForm.dateRead = parseDateInput(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="lbl block mb-1">Review</label>
        <textarea
          v-model="reviewForm.reviewText"
          rows="4"
          placeholder="What did you think?"
          class="field w-full px-3 py-2 rounded-lg text-sm resize-none"
        />
        <label class="flex items-center gap-2 mt-2 text-sm text-muted cursor-pointer">
          <input v-model="reviewForm.containsSpoilers" type="checkbox" class="rounded">
          Contains spoilers
        </label>
      </div>
      <button
        type="button"
        :disabled="saving"
        class="addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium"
        @click="saveReview"
      >
        {{ saving ? 'Saving…' : 'Save review' }}
      </button>
    </div>

    <div class="border-t hair pt-6 space-y-3">
      <h2 class="font-semibold text-bone">Tags</h2>
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
          class="field px-2 py-1 rounded-lg text-sm"
          @change="handleAddTag(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''"
        >
          <option value="">+ Add tag</option>
          <option v-for="t in availableTags" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </div>
    </div>

    <div class="border-t hair pt-6">
      <button
        v-if="!showDeleteConfirm"
        type="button"
        class="text-sm text-red-400 hover:text-red-300"
        @click="showDeleteConfirm = true"
      >
        Delete book
      </button>
      <div v-else class="flex items-center gap-3">
        <p class="text-sm text-muted">Remove "{{ book.title }}" from your library?</p>
        <button
          type="button"
          class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-bone rounded-lg text-sm font-medium"
          @click="handleDelete"
        >
          Delete
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm text-muted hover:text-bone"
          @click="showDeleteConfirm = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20 text-faint">
    <p>Book not found.</p>
    <NuxtLink to="/" class="mt-2 text-brass hover:text-brass-soft text-sm">← Back to library</NuxtLink>
  </div>
</template>
