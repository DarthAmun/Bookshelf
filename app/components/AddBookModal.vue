<script setup lang="ts">
import { useLibrary } from '~/composables/useLibrary'
import { addBook } from '~/composables/useBooks'
import { addSeries, findSeriesByName } from '~/composables/useSeries'
import { db } from '~/composables/useDb'
import { extractAsin, extractUrlSlug, lookupByAsin, searchGoogleBooks } from '~/services/bookLookup'
import type { BookMeta } from '~/services/bookLookup'
import { SPINE_COLORS, colorFromString, spineInitialFor, surnameOf } from '~/utils/bookTheme'
import type { Book } from '~/composables/useDb'

const GENRES = ['Fantasy','Sci-Fi','Thriller','Historical Fiction','Mystery','Romance','Horror','Non-fiction']
const STATUS_OPTIONS: Array<{ value: Book['status']; label: string }> = [
  { value: 'want_to_read', label: 'Want' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'abandoned', label: 'Abandoned' },
]

interface LookupHit extends BookMeta { displayColor: string }

const { books } = useLibrary()
const accNoDisplay = computed(() => String(books.value.length + 1).padStart(4, '0'))

const emit = defineEmits<{ (e: 'added', id: string): void }>()

// template refs
const isOpen = ref(false)
const titleInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// --- reactive form (all form fields in one object) ---
function defaultForm() {
  return {
    title: '', author: '', genre: '', seriesName: '', seriesPos: '',
    selectedCloth: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)]!,
    selectedStatus: 'want_to_read' as Book['status'],
    coverUrl: null as string | null, // URL-based cover (from lookup)
  }
}
const form = reactive(defaultForm())

// --- blob URL for file-based cover preview ---
const coverFile = ref<File | null>(null)
const coverBlobUrl = ref<string | null>(null)
// unified preview: prefer blob URL (file drop), fall back to lookup URL
const coverPreview = computed(() => coverBlobUrl.value ?? form.coverUrl)

function revokeBlobUrl() {
  if (coverBlobUrl.value) { URL.revokeObjectURL(coverBlobUrl.value); coverBlobUrl.value = null }
  coverFile.value = null
}

function setCoverFile(file: File) {
  revokeBlobUrl()
  coverFile.value = file
  coverBlobUrl.value = URL.createObjectURL(file)
  form.coverUrl = null // file takes priority over URL
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// --- UI state ---
const isSaving = ref(false)
const coverDropActive = ref(false)

// --- lookup state ---
const lookupQuery = ref('')
const lookupResults = ref<LookupHit[]>([])
const lookupHasNoResults = ref(false)
const isLookingUp = ref(false)
let lookupTimer: ReturnType<typeof setTimeout> | null = null
const showLookupResults = ref(false)

// spine preview
const spineInitial = computed(() => spineInitialFor(form.title.trim() || 'T'))
const spineSurname = computed(() => surnameOf(form.author.trim()) || 'Author')
const titleDisplay = computed(() => form.title.trim() || 'Untitled')
const isValid = computed(() => !!(form.title.trim() && form.author.trim()))

defineExpose({ open })

function open() {
  Object.assign(form, defaultForm())
  revokeBlobUrl()
  lookupQuery.value = ''
  lookupResults.value = []
  lookupHasNoResults.value = false
  showLookupResults.value = false
  coverDropActive.value = false
  isLookingUp.value = false
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => titleInput.value?.focus())
}

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
  showLookupResults.value = false
  revokeBlobUrl()
}

// lookup helpers
function finishSearch(hits: Partial<Book>[]) {
  lookupResults.value = hits.map(b => ({ ...b, displayColor: colorFromString(b.title ?? '') }))
  lookupHasNoResults.value = hits.length === 0
  showLookupResults.value = true
}

async function doSearch(query: string) {
  isLookingUp.value = true
  try { finishSearch(await searchGoogleBooks(query)) }
  finally { isLookingUp.value = false }
}

async function onLookupInput() {
  const q = lookupQuery.value.trim()
  if (!q) { lookupResults.value = []; showLookupResults.value = false; lookupHasNoResults.value = false; return }
  if (lookupTimer) clearTimeout(lookupTimer)

  if (/amazon\./i.test(q) || /\/dp\/[A-Z0-9]{10}/i.test(q)) {
    const asin = extractAsin(q)
    if (asin) {
      isLookingUp.value = true
      try {
        const result = await lookupByAsin(asin, extractUrlSlug(q) ?? undefined)
        if (result.status === 'found') {
          lookupResults.value = [{ ...result.book, displayColor: colorFromString(asin) }]
          lookupHasNoResults.value = false
          showLookupResults.value = true
        } else if (result.status === 'needs_search' && result.suggestedQuery) {
          await doSearch(result.suggestedQuery)
        }
      } finally {
        isLookingUp.value = false
      }
      return
    }
  }

  lookupTimer = setTimeout(async () => {
    const q2 = lookupQuery.value.trim()
    if (q2) await doSearch(q2)
  }, 400)
}

function selectResult(r: LookupHit) {
  if (r.title) form.title = r.title
  if (r.author) form.author = r.author
  if (r.genre) form.genre = r.genre
  if (r.coverUrl) { form.coverUrl = r.coverUrl; revokeBlobUrl() }
  form.selectedCloth = r.displayColor
  if (r.seriesNameHint && !form.seriesName) form.seriesName = r.seriesNameHint
  if (r.seriesPosHint && !form.seriesPos) form.seriesPos = String(r.seriesPosHint)
  lookupQuery.value = ''
  showLookupResults.value = false
}

function hideLookupResults() {
  setTimeout(() => { showLookupResults.value = false }, 150)
}

// cover drop / file pick
function onCoverDrop(e: DragEvent) {
  e.preventDefault()
  coverDropActive.value = false
  const file = [...(e.dataTransfer?.files ?? [])].find(f => f.type.startsWith('image/'))
  if (file) setCoverFile(file)
}
function triggerFilePicker() { fileInput.value?.click() }
function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setCoverFile(file)
}
function clearCover() { revokeBlobUrl(); form.coverUrl = null }

// save
async function save() {
  if (!isValid.value || isSaving.value) return
  isSaving.value = true
  try {
    // resolve series
    let seriesId: string | undefined
    const sName = form.seriesName.trim()
    if (sName) {
      const existing = await findSeriesByName(sName)
      seriesId = existing ? existing.id : (await addSeries({ name: sName, author: form.author.trim(), newReleaseAvailable: false })).id
    }

    // parse series position
    let seriesPosition: number | undefined
    let knownTotal: number | undefined
    const posMatch = form.seriesPos.trim().match(/(\d+)(?:\s*(?:of|\/)\s*(\d+))?/)
    if (posMatch) {
      seriesPosition = parseInt(posMatch[1]!)
      if (posMatch[2]) knownTotal = parseInt(posMatch[2])
    }
    if (seriesId && knownTotal) await db.series.update(seriesId, { knownTotal })

    // resolve cover: convert file to DataURL on save; URL-based covers stored as-is
    const coverUrl = coverFile.value
      ? await fileToDataUrl(coverFile.value)
      : (form.coverUrl ?? undefined)

    const book = await addBook({
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || undefined,
      seriesId,
      seriesPosition,
      status: form.selectedStatus,
      coverUrl,
    })

    emit('added', book.id)
    close()
  } finally {
    isSaving.value = false
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (lookupTimer) clearTimeout(lookupTimer)
  revokeBlobUrl()
})
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" id="addModal">
      <div class="scrim" @click="close" />

      <div class="sheet">
        <!-- header -->
        <div class="sheet-head">
          <div class="flex items-center gap-4">
            <span class="punch"><i /><i /><i /></span>
            <div>
              <div class="lbl mb-1">Accession · No. {{ accNoDisplay }}</div>
              <div class="font-serif text-[20px] leading-tight text-bone">Add to shelf</div>
            </div>
          </div>
          <button class="xbtn" type="button" aria-label="Close" @click="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- two-panel body -->
        <div class="grid grid-cols-1 md:grid-cols-[260px_1fr]">
          <!-- LEFT: preview rail -->
          <div class="flex flex-col gap-6 border-b p-6 hair md:border-b-0 md:border-r">
            <div>
              <div class="lbl mb-3">Preview</div>
              <!-- spine uses the shared .spine class + .preview-spine for size overrides -->
              <div v-if="!coverPreview" class="spine preview-spine" :style="{ '--c': form.selectedCloth }">
                <div class="spine-head">{{ spineInitial }}</div>
                <div class="spine-rule"></div>
                <div class="spine-title">{{ titleDisplay }}</div>
                <div class="spine-foot">{{ spineSurname }}</div>
              </div>
              <div v-else class="preview-cover relative">
                <img :src="coverPreview" alt="Cover preview">
                <button
                  type="button"
                  class="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-bone"
                  @click="clearCover"
                >×</button>
              </div>
            </div>

            <!-- cloth swatches -->
            <div v-if="!coverPreview">
              <div class="lbl mb-2.5">Cloth colour</div>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="c in SPINE_COLORS"
                  :key="c"
                  type="button"
                  class="swatch"
                  :class="{ selected: c === form.selectedCloth }"
                  :style="{ background: c }"
                  :aria-label="c"
                  @click="form.selectedCloth = c"
                />
              </div>
            </div>

            <!-- drop zone -->
            <div
              class="drop-cover flex cursor-pointer flex-col items-center gap-1.5 px-4 py-5 text-center"
              :class="{ hot: coverDropActive }"
              @dragover.prevent="coverDropActive = true"
              @dragleave="coverDropActive = false"
              @drop="onCoverDrop"
              @click="triggerFilePicker"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="text-faint">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <div class="lbl">Drop cover image</div>
              <div class="font-mono text-[10px] text-faint">or click to browse</div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect">
          </div>

          <!-- RIGHT: form -->
          <div class="flex flex-col gap-5 p-6">
            <!-- lookup -->
            <div class="relative">
              <div class="lbl mb-2">Find on Amazon / Google Books</div>
              <div class="relative">
                <input
                  v-model="lookupQuery"
                  type="text"
                  class="field w-full rounded-md py-2 pl-3 pr-9 font-sans text-sm"
                  placeholder="Title, author or Amazon URL…"
                  @input="onLookupInput"
                  @blur="hideLookupResults"
                >
                <span v-if="isLookingUp" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg class="animate-spin text-faint" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </span>
              </div>
              <div
                v-if="showLookupResults"
                class="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border py-1.5 hair"
                style="background:#1b1711; box-shadow: 0 20px 40px -10px rgba(0,0,0,.7);"
              >
                <div
                  v-for="(r, i) in lookupResults"
                  :key="i"
                  class="lookup-result"
                  @mousedown.prevent="selectResult(r)"
                >
                  <div class="mini-spine" :style="{ background: r.displayColor }" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate font-serif text-sm text-bone">{{ r.title }}</div>
                    <div class="font-mono text-[10px] text-faint">{{ r.author }}</div>
                  </div>
                </div>
                <div v-if="lookupHasNoResults" class="px-4 py-3 font-mono text-[11px] text-faint">No results found</div>
              </div>
            </div>

            <!-- divider -->
            <div class="flex items-center gap-4">
              <div class="h-px flex-1" style="background: rgba(200,180,140,.1)" />
              <div class="lbl">or enter by hand</div>
              <div class="h-px flex-1" style="background: rgba(200,180,140,.1)" />
            </div>

            <!-- form fields -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <div class="lbl mb-1.5">Title</div>
                <input ref="titleInput" v-model="form.title" type="text" class="field w-full rounded-md py-2 px-3 font-sans text-sm" placeholder="The Name of the Wind">
              </div>
              <div class="col-span-2">
                <div class="lbl mb-1.5">Author</div>
                <input v-model="form.author" type="text" class="field w-full rounded-md py-2 px-3 font-sans text-sm" placeholder="Patrick Rothfuss">
              </div>
              <div>
                <div class="lbl mb-1.5">Genre</div>
                <input v-model="form.genre" type="text" list="modal-genres" class="field w-full rounded-md py-2 px-3 font-sans text-sm" placeholder="Fantasy">
                <datalist id="modal-genres">
                  <option v-for="g in GENRES" :key="g" :value="g" />
                </datalist>
              </div>
              <div>
                <div class="lbl mb-1.5">Book #</div>
                <input v-model="form.seriesPos" type="text" class="field w-full rounded-md py-2 px-3 font-sans text-sm" placeholder="2 of 7">
              </div>
              <div class="col-span-2">
                <div class="lbl mb-1.5">Series</div>
                <input v-model="form.seriesName" type="text" class="field w-full rounded-md py-2 px-3 font-sans text-sm" placeholder="The Kingkiller Chronicle">
              </div>
            </div>

            <!-- status selector -->
            <div>
              <div class="lbl mb-2">Status</div>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="s in STATUS_OPTIONS"
                  :key="s.value"
                  type="button"
                  class="mstatus"
                  :class="{ selected: form.selectedStatus === s.value }"
                  @click="form.selectedStatus = s.value"
                >
                  <span class="dot" />
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- footer -->
            <div class="mt-auto flex items-center justify-between gap-4 border-t pt-4" style="border-color: rgba(200,180,140,.1)">
              <div class="font-mono text-[10px] text-faint">
                {{ isValid ? 'Ready to shelve' : 'Title and author are required' }}
              </div>
              <div class="flex items-center gap-2.5">
                <button
                  type="button"
                  class="rounded-md border px-4 py-2 font-sans text-[13px] text-muted transition-colors hover:border-muted hover:text-bone"
                  style="border-color: rgba(200,180,140,.14)"
                  @click="close"
                >Cancel</button>
                <button
                  type="button"
                  class="addbtn rounded-md px-5 py-2 font-sans text-sm font-medium"
                  :disabled="!isValid || isSaving"
                  @click="save"
                >{{ isSaving ? 'Shelving…' : 'Shelve it' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
