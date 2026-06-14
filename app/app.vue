<script setup lang="ts">
import { checkAllSeries } from '~/services/seriesChecker'
import { useLibrary } from '~/composables/useLibrary'

const { public: { googleBooksApiKey } } = useRuntimeConfig()

const { books, reviews } = useLibrary()

const bookCount = computed(() => books.value.length)

const booksReadThisYear = computed(() => {
  const year = new Date().getFullYear()
  const yearStart = new Date(year, 0, 1).getTime()
  const yearEnd = new Date(year + 1, 0, 1).getTime()
  return reviews.value.filter(
    r => r.dateRead && r.dateRead >= yearStart && r.dateRead < yearEnd
  ).length
})

onMounted(async () => {
  await checkAllSeries(googleBooksApiKey)
})
</script>

<template>
  <div class="atmos glow"></div>
  <div class="atmos grain"></div>

  <div class="relative z-10 mx-auto flex max-w-[1280px] min-h-screen">
    <!-- sidebar -->
    <aside class="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col justify-between border-r hair px-7 py-8 md:flex">
      <div>
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="flex h-9 w-7 items-end gap-[3px] rounded-[2px] bg-ink-800 px-[5px] pb-[5px] ring-1 ring-inset ring-white/5">
            <i class="block w-[3px] rounded-sm bg-brass" style="height:14px"></i>
            <i class="block w-[3px] rounded-sm bg-[#6e3338]" style="height:20px"></i>
            <i class="block w-[3px] rounded-sm bg-[#2f3f5c]" style="height:11px"></i>
          </span>
          <span class="font-serif text-[22px] font-medium tracking-tight text-bone">Bookshelf</span>
        </NuxtLink>

        <nav class="mt-12 flex flex-col gap-1 text-[15px]">
          <NuxtLink
            to="/"
            active-class=""
            exact-active-class="active"
            class="navlink flex items-center gap-3 rounded-md px-3 py-2.5 text-muted hover:text-bone hover:bg-white/[.02] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M4 5v14M4 5h10a2 2 0 0 1 2 2v12H6a2 2 0 0 0-2 0"/>
              <path d="M16 7l3.4-.8a1 1 0 0 1 1.2.8l2.3 11.2"/>
            </svg>
            Library
          </NuxtLink>
          <NuxtLink
            to="/series"
            active-class="active"
            class="navlink flex items-center gap-3 rounded-md px-3 py-2.5 text-muted hover:text-bone hover:bg-white/[.02] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
            Series
          </NuxtLink>
          <NuxtLink
            to="/stats"
            active-class="active"
            class="navlink flex items-center gap-3 rounded-md px-3 py-2.5 text-muted hover:text-bone hover:bg-white/[.02] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M5 19V11M12 19V5M19 19v-6"/>
            </svg>
            Stats
          </NuxtLink>
          <NuxtLink
            to="/settings"
            active-class="active"
            class="navlink flex items-center gap-3 rounded-md px-3 py-2.5 text-muted hover:text-bone hover:bg-white/[.02] transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M5 8h9M18 8h1M5 16h1M10 16h9"/>
              <circle cx="16" cy="8" r="2"/>
              <circle cx="8" cy="16" r="2"/>
            </svg>
            Settings
          </NuxtLink>
        </nav>
      </div>

      <div class="border-t hair pt-5">
        <div class="font-mono text-[10px] uppercase tracking-[.18em] text-faint">Your library</div>
        <div class="mt-1.5 font-serif text-[15px] text-muted">
          {{ bookCount }} volumes
          <template v-if="booksReadThisYear > 0">
            · <span class="text-brass">{{ booksReadThisYear }}</span> read in {{ new Date().getFullYear() }}
          </template>
        </div>
      </div>
    </aside>

    <!-- main content -->
    <main class="min-w-0 flex-1 px-7 py-9 sm:px-10">
      <NuxtPage />
    </main>
  </div>
</template>
