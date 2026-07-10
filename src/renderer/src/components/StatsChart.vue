<script setup lang="ts">
const props = defineProps<{
  data: Array<{ label: string; value: number }>
  type?: 'bar' | 'horizontal-bar'
}>()

const max = computed(() => Math.max(...props.data.map(d => d.value), 1))
</script>

<template>
  <div v-if="type === 'horizontal-bar'" class="space-y-2">
    <div v-for="item in data" :key="item.label" class="flex items-center gap-3">
      <span class="text-xs text-faint w-28 truncate flex-shrink-0 text-right">{{ item.label }}</span>
      <div class="flex-1 bg-ink-800 rounded-full h-4 overflow-hidden">
        <div
          class="h-full bg-brass rounded-full transition-all duration-500"
          :style="{ width: `${(item.value / max) * 100}%` }"
        />
      </div>
      <span class="text-xs font-medium text-muted w-6 flex-shrink-0">{{ item.value }}</span>
    </div>
  </div>

  <div v-else class="flex items-end gap-2 h-32">
    <div v-for="item in data" :key="item.label" class="flex flex-col items-center gap-1 flex-1">
      <span class="text-xs text-muted font-medium">{{ item.value }}</span>
      <div
        class="w-full bg-brass rounded-t transition-all duration-500 min-h-1"
        :style="{ height: `${(item.value / max) * 96}px` }"
      />
      <span class="text-xs text-faint truncate max-w-full">{{ item.label }}</span>
    </div>
  </div>
</template>
