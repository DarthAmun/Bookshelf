import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'

export function useHead(opts: { title: string | (() => string) }): void {
  watchEffect(() => {
    document.title = typeof opts.title === 'function' ? opts.title() : opts.title
  })
}

export function navigateTo(path: string): ReturnType<ReturnType<typeof useRouter>['push']> {
  return useRouter().push(path)
}
