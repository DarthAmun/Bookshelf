<script setup lang="ts">
const props = defineProps<{ modelValue?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: number): void }>()

const hovered = ref<number | null>(null)
const displayed = computed(() => hovered.value ?? props.modelValue ?? 0)

function setRating(val: number) {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="n in 10"
      :key="n"
      type="button"
      class="text-lg leading-none focus:outline-none transition-colors"
      :class="n <= displayed ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'"
      @mouseenter="hovered = n"
      @mouseleave="hovered = null"
      @click="setRating(n)"
    >
      {{ n % 2 !== 0 ? '⬠' : '★' }}
    </button>
    <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
      {{ modelValue ? `${modelValue}/10` : 'No rating' }}
    </span>
  </div>
</template>
