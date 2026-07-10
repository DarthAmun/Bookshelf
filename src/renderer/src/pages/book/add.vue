<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addBook } from '~/composables/useBooks'
import type { Book } from '~/types'

useHead({ title: 'Add Book — Bookshelf' })

const router = useRouter()
const activeTab = ref<'amazon' | 'manual'>('amazon')

const amazonUrl = ref('')
const lookupLoading = ref(false)
const lookupError = ref('')

type Phase = { kind: 'idle' } | { kind: 'found' }
const phase = ref<Phase>({ kind: 'idle' })
const bookData = ref<Partial<Book>>({ status: 'want_to_read' })

async function handleLookup() {
  const url = amazonUrl.value.trim()
  if (!url) return
  lookupLoading.value = true
  lookupError.value = ''
  phase.value = { kind: 'idle' }

  try {
    const result = await window.bookshelf.scrapeBook(url)
    if (result.error) {
      lookupError.value = result.error
      return
    }
    bookData.value = {
      title: result.title,
      author: result.author,
      coverUrl: result.coverUrl,
      asin: result.asin,
      amazonUrl: url,
      description: result.description,
      publishedDate: result.publishedDate,
      status: 'want_to_read',
    }
    phase.value = { kind: 'found' }
  } finally {
    lookupLoading.value = false
  }
}

async function handleSave() {
  if (!bookData.value.title || !bookData.value.author) return
  await addBook(bookData.value as Omit<Book, 'id' | 'dateAdded'>)
  router.push('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/" class="text-faint hover:text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </RouterLink>
      <h1 class="font-serif text-[28px] font-medium text-bone">Add a book</h1>
    </div>

    <div class="flex gap-1 bg-ink-800 p-1 rounded-lg w-fit">
      <button
        type="button"
        :class="activeTab === 'amazon' ? 'bg-ink-850 shadow-sm text-bone' : 'text-muted'"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
        @click="activeTab = 'amazon'"
      >
        Amazon link
      </button>
      <button
        type="button"
        :class="activeTab === 'manual' ? 'bg-ink-850 shadow-sm text-bone' : 'text-muted'"
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
        @click="activeTab = 'manual'"
      >
        Manual entry
      </button>
    </div>

    <!-- Amazon tab -->
    <div v-if="activeTab === 'amazon'" class="space-y-5">
      <div class="flex gap-2">
        <input
          v-model="amazonUrl"
          type="url"
          placeholder="Paste Amazon.de URL…"
          class="field flex-1 px-3 py-2 rounded-lg text-sm"
          @keydown.enter="handleLookup"
        >
        <button
          type="button"
          :disabled="lookupLoading || !amazonUrl"
          class="addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium"
          @click="handleLookup"
        >
          {{ lookupLoading ? 'Fetching…' : 'Look up' }}
        </button>
      </div>

      <p v-if="lookupError" class="text-sm text-red-400">{{ lookupError }}</p>

      <div v-if="phase.kind === 'found'" class="space-y-4">
        <div v-if="bookData.coverUrl || bookData.title" class="flex gap-4">
          <CoverImage :src="bookData.coverUrl" :alt="bookData.title" class="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden" />
          <div class="text-sm text-muted space-y-1">
            <p v-if="bookData.title" class="font-semibold text-bone text-base">{{ bookData.title }}</p>
            <p v-if="bookData.author">by {{ bookData.author }}</p>
            <p v-if="bookData.publishedDate">{{ bookData.publishedDate }}</p>
          </div>
        </div>
        <BookForm v-model="bookData" @submit="handleSave" />
      </div>
    </div>

    <!-- Manual tab -->
    <div v-else>
      <BookForm v-model="bookData" @submit="handleSave" />
    </div>
  </div>
</template>
