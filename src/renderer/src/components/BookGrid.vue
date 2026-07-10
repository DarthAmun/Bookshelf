<script setup lang="ts">
import type { Book, Review } from '~/types'

const props = defineProps<{ books: Book[]; reviews?: Record<string, Review> }>()

// mirrors the sm:grid-cols-4 breakpoint (640px = Tailwind's `sm`)
const cols = ref(4)

onMounted(() => {
  const mq = window.matchMedia('(min-width: 640px)')
  cols.value = mq.matches ? 4 : 2
  const handler = (e: MediaQueryListEvent) => { cols.value = e.matches ? 4 : 2 }
  mq.addEventListener('change', handler)
  onUnmounted(() => mq.removeEventListener('change', handler))
})

const rows = computed(() =>
  Array.from(
    { length: Math.ceil(props.books.length / cols.value) },
    (_, i) => ({ books: props.books.slice(i * cols.value, (i + 1) * cols.value), startIndex: i * cols.value })
  )
)
</script>

<template>
  <div v-if="books.length">
    <div v-for="row in rows" :key="row.startIndex" class="shelf">
      <div class="grid grid-cols-2 items-end gap-x-6 gap-y-2 sm:grid-cols-4">
        <BookCard
          v-for="(book, j) in row.books"
          :key="book.id"
          :book="book"
          :review="reviews?.[book.id]"
          :index="row.startIndex + j"
        />
      </div>
      <div class="shelf-edge"></div>
    </div>
  </div>
</template>
