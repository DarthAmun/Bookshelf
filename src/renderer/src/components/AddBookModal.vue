<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { addBook } from '~/composables/useBooks'
import { addSeries, findSeriesByName } from '~/composables/useSeries'
import { useLibraryStore } from '../stores/library'
import { SPINE_COLORS, colorFromString, spineInitialFor, surnameOf } from '~/utils/bookTheme'
import type { Book } from '~/types'

const store = useLibraryStore()
const bookCount = computed(() => store.books.length)
const accNoDisplay = computed(() => String(bookCount.value + 1).padStart(4, '0'))

const emit = defineEmits<{ (e: 'added', id: string): void }>()

const isOpen = ref(false)
const titleInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

const GENRES = ['Fantasy', 'Sci-Fi', 'Thriller', 'Historical Fiction', 'Mystery', 'Romance', 'Horror', 'Non-fiction']
const STATUS_OPTIONS: Array<{ value: Book['status']; label: string }> = [
  { value: 'want_to_read', label: 'Want' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'abandoned', label: 'Abandoned' },
]

function defaultForm() {
  return {
    title: '', author: '', genre: '', seriesName: '', seriesPos: '', amazonUrl: '',
    selectedCloth: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)]!,
    selectedStatus: 'want_to_read' as Book['status'],
    coverUrl: null as string | null,
  }
}
const form = reactive(defaultForm())

const coverFile = ref<File | null>(null)
const coverBlobUrl = ref<string | null>(null)
const coverPreview = computed(() => coverBlobUrl.value ?? form.coverUrl)

function revokeBlobUrl() {
  if (coverBlobUrl.value) { URL.revokeObjectURL(coverBlobUrl.value); coverBlobUrl.value = null }
  coverFile.value = null
}

function setCoverFile(file: File) {
  revokeBlobUrl()
  coverFile.value = file
  coverBlobUrl.value = URL.createObjectURL(file)
  form.coverUrl = null
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Amazon scrape state
const amazonUrl = ref('')
const isScraping = ref(false)
const scrapeError = ref('')
const scrapeSuccess = ref(false)

const isSaving = ref(false)
const coverDropActive = ref(false)

const spineInitial = computed(() => spineInitialFor(form.title.trim() || 'T'))
const spineSurname = computed(() => surnameOf(form.author.trim()) || 'Author')
const titleDisplay = computed(() => form.title.trim() || 'Untitled')
const isValid = computed(() => !!(form.title.trim() && form.author.trim()))

defineExpose({ open })

function open() {
  Object.assign(form, defaultForm())
  revokeBlobUrl()
  amazonUrl.value = ''
  scrapeError.value = ''
  scrapeSuccess.value = false
  isScraping.value = false
  coverDropActive.value = false
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => titleInput.value?.focus())
}

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
  revokeBlobUrl()
}

async function handleAmazonLookup() {
  const url = amazonUrl.value.trim()
  if (!url) return
  isScraping.value = true
  scrapeError.value = ''
  scrapeSuccess.value = false
  try {
    const result = await window.bookshelf.scrapeBook(url)
    if (result.error) {
      scrapeError.value = result.error
      return
    }
    if (result.title) form.title = result.title
    if (result.author) form.author = result.author
    if (result.coverUrl) { form.coverUrl = result.coverUrl; revokeBlobUrl() }
    if (result.seriesName && !form.seriesName) form.seriesName = result.seriesName
    if (result.seriesPosition && !form.seriesPos) form.seriesPos = String(result.seriesPosition)
    form.amazonUrl = url
    form.selectedCloth = colorFromString(result.asin ?? url)
    scrapeSuccess.value = true
  } finally {
    isScraping.value = false
  }
}

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

async function save() {
  if (!isValid.value || isSaving.value) return
  isSaving.value = true
  try {
    let seriesId: string | undefined
    const sName = form.seriesName.trim()
    if (sName) {
      const existing = await findSeriesByName(sName)
      seriesId = existing
        ? existing.id
        : (await addSeries({ name: sName, author: form.author.trim(), newReleaseAvailable: false })).id
    }

    let seriesPosition: number | undefined
    let knownTotal: number | undefined
    const posMatch = form.seriesPos.trim().match(/(\d+)(?:\s*(?:of|\/)\s*(\d+))?/)
    if (posMatch) {
      seriesPosition = parseInt(posMatch[1]!)
      if (posMatch[2]) knownTotal = parseInt(posMatch[2])
    }
    if (seriesId && knownTotal) {
      await window.bookshelf.updateSeries(seriesId, { knownTotal })
    }

    const coverUrl = coverFile.value
      ? await fileToDataUrl(coverFile.value)
      : (form.coverUrl ?? undefined)

    const book = await addBook({
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || undefined,
      amazonUrl: form.amazonUrl.trim() || undefined,
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
            <!-- Amazon lookup -->
            <div>
              <div class="lbl mb-2">Look up on Amazon</div>
              <div class="flex gap-2">
                <input
                  v-model="amazonUrl"
                  type="url"
                  class="field flex-1 rounded-md py-2 px-3 font-sans text-sm"
                  placeholder="Paste Amazon.de URL…"
                  @keydown.enter="handleAmazonLookup"
                >
                <button
                  type="button"
                  :disabled="isScraping || !amazonUrl"
                  class="addbtn px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60"
                  @click="handleAmazonLookup"
                >
                  {{ isScraping ? 'Fetching…' : 'Look up' }}
                </button>
              </div>
              <p v-if="scrapeError" class="mt-1.5 text-xs text-red-400">{{ scrapeError }}</p>
              <p v-if="scrapeSuccess" class="mt-1.5 text-xs text-[#9bc093]">Metadata filled from Amazon</p>
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
