<script setup lang="ts">
import type { Book } from '~/composables/useDb'

defineProps<{ status: Book['status'] }>()

const labels: Record<Book['status'], string> = {
  want_to_read: 'Want to read',
  reading: 'Reading',
  read: 'Read',
  abandoned: 'Abandoned',
}

const badgeClass: Record<Book['status'], string> = {
  want_to_read: 's-want',
  reading: 's-reading',
  read: 's-read',
  abandoned: 's-abandoned',
}
</script>

<template>
  <span class="badge" :class="badgeClass[status]">
    <span class="dot"></span>
    {{ labels[status] }}
  </span>
</template>
