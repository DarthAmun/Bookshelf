<script setup lang="ts">
import type { Tag } from '~/types'

const props = defineProps<{ tag: Tag; removable?: boolean }>()
const emit = defineEmits<{ (e: 'remove'): void }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
    :style="{ backgroundColor: props.tag.color }"
  >
    {{ tag.label }}
    <button
      v-if="removable"
      type="button"
      class="ml-0.5 hover:opacity-75 focus:outline-none"
      @click.stop="emit('remove')"
    >
      ×
    </button>
  </span>
</template>
