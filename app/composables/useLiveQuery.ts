import { liveQuery } from 'dexie'
import { ref, onUnmounted } from 'vue'

export function useLiveQuery<T>(querier: () => T | Promise<T>, defaultValue: T) {
  const result = ref<T>(defaultValue)
  const subscription = liveQuery(querier).subscribe({
    next: (val) => { result.value = val as T },
    error: (e) => console.error(e),
  })
  onUnmounted(() => subscription.unsubscribe())
  return result
}
