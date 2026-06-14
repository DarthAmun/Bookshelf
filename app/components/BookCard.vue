<script setup lang="ts">
import type { Book, Review } from '~/composables/useDb'

const props = defineProps<{ book: Book; review?: Review; index: number }>()

const HEIGHTS = [248, 266, 256, 272, 250, 262]
const COLORS = ['#2f3f5c', '#6e3338', '#244a4a', '#7a3a3f', '#553a55', '#6e4329', '#2f5052', '#7a5f2c', '#34503f', '#3c4250', '#46324a', '#494f3a']

const spineHeight = computed(() => HEIGHTS[props.index % HEIGHTS.length])
const spineColor = computed(() => {
  const hash = [...props.book.id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return COLORS[hash % COLORS.length]
})
const spineInitial = computed(() =>
  props.book.title.replace(/^(The|A|An)\s+/i, '').charAt(0).toUpperCase()
)
const spineAuthorSurname = computed(() =>
  props.book.author.split(' ').pop() ?? props.book.author
)

const animationDelay = computed(() => `${props.index * 45}ms`)
</script>

<template>
  <article
    class="book group"
    :style="{ animationDelay }"
  >
    <NuxtLink :to="`/book/${book.id}`" class="block flex flex-col items-center justify-end">
      <!-- face-out cover -->
      <template v-if="book.coverUrl">
        <div class="cover">
          <img :src="book.coverUrl" :alt="`${book.title} cover`" draggable="false" />
        </div>
        <div class="book-shadow cover-shadow"></div>
      </template>

      <!-- spine fallback -->
      <template v-else>
        <div
          class="spine"
          :style="{ '--c': spineColor, '--h': `${spineHeight}px` }"
        >
          <div class="spine-head">{{ spineInitial }}</div>
          <div class="spine-rule"></div>
          <div class="spine-title">{{ book.title }}</div>
          <div class="spine-foot">{{ spineAuthorSurname }}</div>
        </div>
        <div class="book-shadow"></div>
      </template>
    </NuxtLink>

    <div class="mt-3.5 text-center">
      <h3 class="font-serif text-[14px] leading-tight text-bone text-balance">{{ book.title }}</h3>
      <div class="mt-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-muted">{{ book.author }}</div>
      <div class="mt-2.5 flex items-center justify-center gap-2.5">
        <RatingDisplay v-if="review?.rating" :rating="review.rating" size="sm" />
        <span v-else class="font-mono text-[10px] uppercase tracking-wider text-faint">unrated</span>
      </div>
      <div class="mt-2 flex justify-center">
        <StatusBadge :status="book.status" />
      </div>
    </div>
  </article>
</template>
