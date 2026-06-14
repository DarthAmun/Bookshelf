<script setup lang="ts">
const props = defineProps<{ rating?: number; size?: 'sm' | 'md' }>()

const starsPercent = computed(() => {
  if (!props.rating) return null
  return ((props.rating / 10) * 100).toFixed(1)
})

const displayRating = computed(() => {
  if (!props.rating) return null
  return (props.rating / 2).toFixed(1).replace(/\.0$/, '')
})
</script>

<template>
  <div v-if="rating" class="flex items-center gap-1.5">
    <span class="stars" :class="size === 'sm' ? 'text-[11px]' : 'text-[13px]'">
      <span class="stars-bg">★★★★★</span>
      <span class="stars-fg" :style="{ width: `${starsPercent}%` }">★★★★★</span>
    </span>
    <span class="font-mono text-[10px] text-faint">{{ displayRating }}</span>
  </div>
</template>
