import { d as defineComponent, u as useLibraryStore, n as nextTick, o as onMounted, a as onUnmounted, b as openBlock, c as createBlock, e as createElementBlock, f as createBaseVNode, t as toDisplayString, g as normalizeStyle, F as Fragment, r as renderList, h as normalizeClass, i as unref, j as createCommentVNode, w as withModifiers, k as withDirectives, v as vModelText, l as withKeys, m as createTextVNode, T as Teleport, p as computed, q as ref, s as reactive, x as createVNode, y as withCtx, z as resolveComponent, A as storeToRefs } from "./index-vRGsP6Kw.js";
import { a as addBook } from "./useBooks-DEAcE43j.js";
import { f as findSeriesByName, a as addSeries } from "./useSeries-C62YMXa0.js";
import { _ as _sfc_main$6 } from "./StatusBadge.vue_vue_type_script_setup_true_lang-vBhcZSrA.js";
import { _ as _sfc_main$5 } from "./RatingDisplay.vue_vue_type_script_setup_true_lang-CRaTVsLZ.js";
import { _ as _sfc_main$7 } from "./NewReleaseBanner.vue_vue_type_script_setup_true_lang-B6I3_5-S.js";
const SPINE_COLORS = [
  "#3c4250",
  "#2f3f5c",
  "#4b3030",
  "#2c4a3e",
  "#4a3b2a",
  "#3a3050",
  "#1e3d59",
  "#5c3d2e",
  "#2d4a22",
  "#4a2c40",
  "#1a3a4a",
  "#3d2a1a",
  "#2a3d2a",
  "#4a3a1a",
  "#1a2a4a"
];
function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i) | 0;
  }
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length];
}
function spineInitialFor(title) {
  return title.replace(/^(The|A|An)\s+/i, "").charAt(0).toUpperCase() || "T";
}
function surnameOf(author) {
  const parts = author.trim().split(/\s+/);
  return parts[parts.length - 1] ?? author;
}
const _hoisted_1$4 = {
  key: 0,
  id: "addModal"
};
const _hoisted_2$4 = { class: "sheet" };
const _hoisted_3$3 = { class: "sheet-head" };
const _hoisted_4$2 = { class: "flex items-center gap-4" };
const _hoisted_5$2 = { class: "lbl mb-1" };
const _hoisted_6$2 = { class: "grid grid-cols-1 md:grid-cols-[260px_1fr]" };
const _hoisted_7$2 = { class: "flex flex-col gap-6 border-b p-6 hair md:border-b-0 md:border-r" };
const _hoisted_8$2 = { class: "spine-head" };
const _hoisted_9$2 = { class: "spine-title" };
const _hoisted_10$2 = { class: "spine-foot" };
const _hoisted_11$1 = {
  key: 1,
  class: "preview-cover relative"
};
const _hoisted_12$1 = ["src"];
const _hoisted_13 = { key: 0 };
const _hoisted_14 = { class: "flex flex-wrap gap-2.5" };
const _hoisted_15 = ["aria-label", "onClick"];
const _hoisted_16 = { class: "flex flex-col gap-5 p-6" };
const _hoisted_17 = { class: "flex gap-2" };
const _hoisted_18 = ["disabled"];
const _hoisted_19 = {
  key: 0,
  class: "mt-1.5 text-xs text-red-400"
};
const _hoisted_20 = {
  key: 1,
  class: "mt-1.5 text-xs text-[#9bc093]"
};
const _hoisted_21 = { class: "grid grid-cols-2 gap-4" };
const _hoisted_22 = { class: "col-span-2" };
const _hoisted_23 = { class: "col-span-2" };
const _hoisted_24 = { id: "modal-genres" };
const _hoisted_25 = ["value"];
const _hoisted_26 = { class: "col-span-2" };
const _hoisted_27 = { class: "grid grid-cols-4 gap-2" };
const _hoisted_28 = ["onClick"];
const _hoisted_29 = {
  class: "mt-auto flex items-center justify-between gap-4 border-t pt-4",
  style: { "border-color": "rgba(200,180,140,.1)" }
};
const _hoisted_30 = { class: "font-mono text-[10px] text-faint" };
const _hoisted_31 = { class: "flex items-center gap-2.5" };
const _hoisted_32 = ["disabled"];
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "AddBookModal",
  emits: ["added"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const store = useLibraryStore();
    const bookCount = computed(() => store.books.length);
    const accNoDisplay = computed(() => String(bookCount.value + 1).padStart(4, "0"));
    const emit = __emit;
    const isOpen = ref(false);
    const titleInput = ref();
    const fileInput = ref();
    const GENRES = ["Fantasy", "Sci-Fi", "Thriller", "Historical Fiction", "Mystery", "Romance", "Horror", "Non-fiction"];
    const STATUS_OPTIONS = [
      { value: "want_to_read", label: "Want" },
      { value: "reading", label: "Reading" },
      { value: "read", label: "Read" },
      { value: "abandoned", label: "Abandoned" }
    ];
    function defaultForm() {
      return {
        title: "",
        author: "",
        genre: "",
        seriesName: "",
        seriesPos: "",
        amazonUrl: "",
        selectedCloth: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
        selectedStatus: "want_to_read",
        coverUrl: null
      };
    }
    const form = reactive(defaultForm());
    const coverFile = ref(null);
    const coverBlobUrl = ref(null);
    const coverPreview = computed(() => coverBlobUrl.value ?? form.coverUrl);
    function revokeBlobUrl() {
      if (coverBlobUrl.value) {
        URL.revokeObjectURL(coverBlobUrl.value);
        coverBlobUrl.value = null;
      }
      coverFile.value = null;
    }
    function setCoverFile(file) {
      revokeBlobUrl();
      coverFile.value = file;
      coverBlobUrl.value = URL.createObjectURL(file);
      form.coverUrl = null;
    }
    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    const amazonUrl = ref("");
    const isScraping = ref(false);
    const scrapeError = ref("");
    const scrapeSuccess = ref(false);
    const isSaving = ref(false);
    const coverDropActive = ref(false);
    const spineInitial = computed(() => spineInitialFor(form.title.trim() || "T"));
    const spineSurname = computed(() => surnameOf(form.author.trim()) || "Author");
    const titleDisplay = computed(() => form.title.trim() || "Untitled");
    const isValid = computed(() => !!(form.title.trim() && form.author.trim()));
    __expose({ open });
    function open() {
      Object.assign(form, defaultForm());
      revokeBlobUrl();
      amazonUrl.value = "";
      scrapeError.value = "";
      scrapeSuccess.value = false;
      isScraping.value = false;
      coverDropActive.value = false;
      isOpen.value = true;
      document.body.style.overflow = "hidden";
      nextTick(() => titleInput.value?.focus());
    }
    function close() {
      isOpen.value = false;
      document.body.style.overflow = "";
      revokeBlobUrl();
    }
    async function handleAmazonLookup() {
      const url = amazonUrl.value.trim();
      if (!url) return;
      isScraping.value = true;
      scrapeError.value = "";
      scrapeSuccess.value = false;
      try {
        const result = await window.bookshelf.scrapeBook(url);
        if (result.error) {
          scrapeError.value = result.error;
          return;
        }
        if (result.title) form.title = result.title;
        if (result.author) form.author = result.author;
        if (result.coverUrl) {
          form.coverUrl = result.coverUrl;
          revokeBlobUrl();
        }
        if (result.seriesName && !form.seriesName) form.seriesName = result.seriesName;
        if (result.seriesPosition && !form.seriesPos) form.seriesPos = String(result.seriesPosition);
        form.amazonUrl = url;
        form.selectedCloth = colorFromString(result.asin ?? url);
        scrapeSuccess.value = true;
      } finally {
        isScraping.value = false;
      }
    }
    function onCoverDrop(e) {
      e.preventDefault();
      coverDropActive.value = false;
      const file = [...e.dataTransfer?.files ?? []].find((f) => f.type.startsWith("image/"));
      if (file) setCoverFile(file);
    }
    function triggerFilePicker() {
      fileInput.value?.click();
    }
    function onFileSelect(e) {
      const file = e.target.files?.[0];
      if (file) setCoverFile(file);
    }
    function clearCover() {
      revokeBlobUrl();
      form.coverUrl = null;
    }
    async function save() {
      if (!isValid.value || isSaving.value) return;
      isSaving.value = true;
      try {
        let seriesId;
        const sName = form.seriesName.trim();
        if (sName) {
          const existing = await findSeriesByName(sName);
          seriesId = existing ? existing.id : (await addSeries({ name: sName, author: form.author.trim(), newReleaseAvailable: false })).id;
        }
        let seriesPosition;
        let knownTotal;
        const posMatch = form.seriesPos.trim().match(/(\d+)(?:\s*(?:of|\/)\s*(\d+))?/);
        if (posMatch) {
          seriesPosition = parseInt(posMatch[1]);
          if (posMatch[2]) knownTotal = parseInt(posMatch[2]);
        }
        if (seriesId && knownTotal) {
          await window.bookshelf.updateSeries(seriesId, { knownTotal });
        }
        const coverUrl = coverFile.value ? await fileToDataUrl(coverFile.value) : form.coverUrl ?? void 0;
        const book = await addBook({
          title: form.title.trim(),
          author: form.author.trim(),
          genre: form.genre.trim() || void 0,
          amazonUrl: form.amazonUrl.trim() || void 0,
          seriesId,
          seriesPosition,
          status: form.selectedStatus,
          coverUrl
        });
        emit("added", book.id);
        close();
      } finally {
        isSaving.value = false;
      }
    }
    onMounted(() => document.addEventListener("keydown", onKeydown));
    onUnmounted(() => {
      document.removeEventListener("keydown", onKeydown);
      revokeBlobUrl();
    });
    function onKeydown(e) {
      if (e.key === "Escape" && isOpen.value) close();
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, { to: "body" }, [
        isOpen.value ? (openBlock(), createElementBlock("div", _hoisted_1$4, [
          createBaseVNode("div", {
            class: "scrim",
            onClick: close
          }),
          createBaseVNode("div", _hoisted_2$4, [
            createBaseVNode("div", _hoisted_3$3, [
              createBaseVNode("div", _hoisted_4$2, [
                _cache[9] || (_cache[9] = createBaseVNode("span", { class: "punch" }, [
                  createBaseVNode("i"),
                  createBaseVNode("i"),
                  createBaseVNode("i")
                ], -1)),
                createBaseVNode("div", null, [
                  createBaseVNode("div", _hoisted_5$2, "Accession · No. " + toDisplayString(accNoDisplay.value), 1),
                  _cache[8] || (_cache[8] = createBaseVNode("div", { class: "font-serif text-[20px] leading-tight text-bone" }, "Add to shelf", -1))
                ])
              ]),
              createBaseVNode("button", {
                class: "xbtn",
                type: "button",
                "aria-label": "Close",
                onClick: close
              }, [..._cache[10] || (_cache[10] = [
                createBaseVNode("svg", {
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2"
                }, [
                  createBaseVNode("path", { d: "M18 6 6 18M6 6l12 12" })
                ], -1)
              ])])
            ]),
            createBaseVNode("div", _hoisted_6$2, [
              createBaseVNode("div", _hoisted_7$2, [
                createBaseVNode("div", null, [
                  _cache[12] || (_cache[12] = createBaseVNode("div", { class: "lbl mb-3" }, "Preview", -1)),
                  !coverPreview.value ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    class: "spine preview-spine",
                    style: normalizeStyle({ "--c": form.selectedCloth })
                  }, [
                    createBaseVNode("div", _hoisted_8$2, toDisplayString(spineInitial.value), 1),
                    _cache[11] || (_cache[11] = createBaseVNode("div", { class: "spine-rule" }, null, -1)),
                    createBaseVNode("div", _hoisted_9$2, toDisplayString(titleDisplay.value), 1),
                    createBaseVNode("div", _hoisted_10$2, toDisplayString(spineSurname.value), 1)
                  ], 4)) : (openBlock(), createElementBlock("div", _hoisted_11$1, [
                    createBaseVNode("img", {
                      src: coverPreview.value,
                      alt: "Cover preview"
                    }, null, 8, _hoisted_12$1),
                    createBaseVNode("button", {
                      type: "button",
                      class: "absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-bone",
                      onClick: clearCover
                    }, "×")
                  ]))
                ]),
                !coverPreview.value ? (openBlock(), createElementBlock("div", _hoisted_13, [
                  _cache[13] || (_cache[13] = createBaseVNode("div", { class: "lbl mb-2.5" }, "Cloth colour", -1)),
                  createBaseVNode("div", _hoisted_14, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(SPINE_COLORS), (c) => {
                      return openBlock(), createElementBlock("button", {
                        key: c,
                        type: "button",
                        class: normalizeClass(["swatch", { selected: c === form.selectedCloth }]),
                        style: normalizeStyle({ background: c }),
                        "aria-label": c,
                        onClick: ($event) => form.selectedCloth = c
                      }, null, 14, _hoisted_15);
                    }), 128))
                  ])
                ])) : createCommentVNode("", true),
                createBaseVNode("div", {
                  class: normalizeClass(["drop-cover flex cursor-pointer flex-col items-center gap-1.5 px-4 py-5 text-center", { hot: coverDropActive.value }]),
                  onDragover: _cache[0] || (_cache[0] = withModifiers(($event) => coverDropActive.value = true, ["prevent"])),
                  onDragleave: _cache[1] || (_cache[1] = ($event) => coverDropActive.value = false),
                  onDrop: onCoverDrop,
                  onClick: triggerFilePicker
                }, [..._cache[14] || (_cache[14] = [
                  createBaseVNode("svg", {
                    width: "18",
                    height: "18",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.6",
                    class: "text-faint"
                  }, [
                    createBaseVNode("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" })
                  ], -1),
                  createBaseVNode("div", { class: "lbl" }, "Drop cover image", -1),
                  createBaseVNode("div", { class: "font-mono text-[10px] text-faint" }, "or click to browse", -1)
                ])], 34),
                createBaseVNode("input", {
                  ref_key: "fileInput",
                  ref: fileInput,
                  type: "file",
                  accept: "image/*",
                  class: "hidden",
                  onChange: onFileSelect
                }, null, 544)
              ]),
              createBaseVNode("div", _hoisted_16, [
                createBaseVNode("div", null, [
                  _cache[15] || (_cache[15] = createBaseVNode("div", { class: "lbl mb-2" }, "Look up on Amazon", -1)),
                  createBaseVNode("div", _hoisted_17, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => amazonUrl.value = $event),
                      type: "url",
                      class: "field flex-1 rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "Paste Amazon.de URL…",
                      onKeydown: withKeys(handleAmazonLookup, ["enter"])
                    }, null, 544), [
                      [vModelText, amazonUrl.value]
                    ]),
                    createBaseVNode("button", {
                      type: "button",
                      disabled: isScraping.value || !amazonUrl.value,
                      class: "addbtn px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60",
                      onClick: handleAmazonLookup
                    }, toDisplayString(isScraping.value ? "Fetching…" : "Look up"), 9, _hoisted_18)
                  ]),
                  scrapeError.value ? (openBlock(), createElementBlock("p", _hoisted_19, toDisplayString(scrapeError.value), 1)) : createCommentVNode("", true),
                  scrapeSuccess.value ? (openBlock(), createElementBlock("p", _hoisted_20, "Metadata filled from Amazon")) : createCommentVNode("", true)
                ]),
                _cache[23] || (_cache[23] = createBaseVNode("div", { class: "flex items-center gap-4" }, [
                  createBaseVNode("div", {
                    class: "h-px flex-1",
                    style: { "background": "rgba(200,180,140,.1)" }
                  }),
                  createBaseVNode("div", { class: "lbl" }, "or enter by hand"),
                  createBaseVNode("div", {
                    class: "h-px flex-1",
                    style: { "background": "rgba(200,180,140,.1)" }
                  })
                ], -1)),
                createBaseVNode("div", _hoisted_21, [
                  createBaseVNode("div", _hoisted_22, [
                    _cache[16] || (_cache[16] = createBaseVNode("div", { class: "lbl mb-1.5" }, "Title", -1)),
                    withDirectives(createBaseVNode("input", {
                      ref_key: "titleInput",
                      ref: titleInput,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.title = $event),
                      type: "text",
                      class: "field w-full rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "The Name of the Wind"
                    }, null, 512), [
                      [vModelText, form.title]
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_23, [
                    _cache[17] || (_cache[17] = createBaseVNode("div", { class: "lbl mb-1.5" }, "Author", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.author = $event),
                      type: "text",
                      class: "field w-full rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "Patrick Rothfuss"
                    }, null, 512), [
                      [vModelText, form.author]
                    ])
                  ]),
                  createBaseVNode("div", null, [
                    _cache[18] || (_cache[18] = createBaseVNode("div", { class: "lbl mb-1.5" }, "Genre", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.genre = $event),
                      type: "text",
                      list: "modal-genres",
                      class: "field w-full rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "Fantasy"
                    }, null, 512), [
                      [vModelText, form.genre]
                    ]),
                    createBaseVNode("datalist", _hoisted_24, [
                      (openBlock(), createElementBlock(Fragment, null, renderList(GENRES, (g) => {
                        return createBaseVNode("option", {
                          key: g,
                          value: g
                        }, null, 8, _hoisted_25);
                      }), 64))
                    ])
                  ]),
                  createBaseVNode("div", null, [
                    _cache[19] || (_cache[19] = createBaseVNode("div", { class: "lbl mb-1.5" }, "Book #", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.seriesPos = $event),
                      type: "text",
                      class: "field w-full rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "2 of 7"
                    }, null, 512), [
                      [vModelText, form.seriesPos]
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_26, [
                    _cache[20] || (_cache[20] = createBaseVNode("div", { class: "lbl mb-1.5" }, "Series", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.seriesName = $event),
                      type: "text",
                      class: "field w-full rounded-md py-2 px-3 font-sans text-sm",
                      placeholder: "The Kingkiller Chronicle"
                    }, null, 512), [
                      [vModelText, form.seriesName]
                    ])
                  ])
                ]),
                createBaseVNode("div", null, [
                  _cache[22] || (_cache[22] = createBaseVNode("div", { class: "lbl mb-2" }, "Status", -1)),
                  createBaseVNode("div", _hoisted_27, [
                    (openBlock(), createElementBlock(Fragment, null, renderList(STATUS_OPTIONS, (s) => {
                      return createBaseVNode("button", {
                        key: s.value,
                        type: "button",
                        class: normalizeClass(["mstatus", { selected: form.selectedStatus === s.value }]),
                        onClick: ($event) => form.selectedStatus = s.value
                      }, [
                        _cache[21] || (_cache[21] = createBaseVNode("span", { class: "dot" }, null, -1)),
                        createTextVNode(" " + toDisplayString(s.label), 1)
                      ], 10, _hoisted_28);
                    }), 64))
                  ])
                ]),
                createBaseVNode("div", _hoisted_29, [
                  createBaseVNode("div", _hoisted_30, toDisplayString(isValid.value ? "Ready to shelve" : "Title and author are required"), 1),
                  createBaseVNode("div", _hoisted_31, [
                    createBaseVNode("button", {
                      type: "button",
                      class: "rounded-md border px-4 py-2 font-sans text-[13px] text-muted transition-colors hover:border-muted hover:text-bone",
                      style: { "border-color": "rgba(200,180,140,.14)" },
                      onClick: close
                    }, "Cancel"),
                    createBaseVNode("button", {
                      type: "button",
                      class: "addbtn rounded-md px-5 py-2 font-sans text-sm font-medium",
                      disabled: !isValid.value || isSaving.value,
                      onClick: save
                    }, toDisplayString(isSaving.value ? "Shelving…" : "Shelve it"), 9, _hoisted_32)
                  ])
                ])
              ])
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$3 = ["data-book-id"];
const _hoisted_2$3 = { class: "cover" };
const _hoisted_3$2 = ["src", "alt"];
const _hoisted_4$1 = { class: "spine-head" };
const _hoisted_5$1 = { class: "spine-title" };
const _hoisted_6$1 = { class: "spine-foot" };
const _hoisted_7$1 = { class: "mt-3.5 text-center" };
const _hoisted_8$1 = { class: "font-serif text-[14px] leading-tight text-bone text-balance" };
const _hoisted_9$1 = { class: "mt-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-muted" };
const _hoisted_10$1 = { class: "mt-2.5 flex items-center justify-center gap-2.5" };
const _hoisted_11 = {
  key: 1,
  class: "font-mono text-[10px] uppercase tracking-wider text-faint"
};
const _hoisted_12 = { class: "mt-2 flex justify-center" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BookCard",
  props: {
    book: {},
    review: {},
    index: {}
  },
  setup(__props) {
    const props = __props;
    const HEIGHTS = [248, 266, 256, 272, 250, 262];
    const spineHeight = computed(() => HEIGHTS[props.index % HEIGHTS.length]);
    const spineColor = computed(() => colorFromString(props.book.id));
    const spineInitial = computed(() => spineInitialFor(props.book.title));
    const spineAuthorSurname = computed(() => surnameOf(props.book.author));
    const animationDelay = computed(() => `${props.index * 45}ms`);
    return (_ctx, _cache) => {
      const _component_NuxtLink = resolveComponent("NuxtLink");
      const _component_RatingDisplay = _sfc_main$5;
      const _component_StatusBadge = _sfc_main$6;
      return openBlock(), createElementBlock("article", {
        class: "book group",
        "data-book-id": __props.book.id,
        style: normalizeStyle({ animationDelay: unref(animationDelay) })
      }, [
        createVNode(_component_NuxtLink, {
          to: `/book/${__props.book.id}`,
          class: "block flex flex-col items-center justify-end"
        }, {
          default: withCtx(() => [
            __props.book.coverUrl ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createBaseVNode("div", _hoisted_2$3, [
                createBaseVNode("img", {
                  src: __props.book.coverUrl,
                  alt: `${__props.book.title} cover`,
                  draggable: "false"
                }, null, 8, _hoisted_3$2)
              ]),
              _cache[0] || (_cache[0] = createBaseVNode("div", { class: "book-shadow cover-shadow" }, null, -1))
            ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createBaseVNode("div", {
                class: "spine",
                style: normalizeStyle({ "--c": unref(spineColor), "--h": `${unref(spineHeight)}px` })
              }, [
                createBaseVNode("div", _hoisted_4$1, toDisplayString(unref(spineInitial)), 1),
                _cache[1] || (_cache[1] = createBaseVNode("div", { class: "spine-rule" }, null, -1)),
                createBaseVNode("div", _hoisted_5$1, toDisplayString(__props.book.title), 1),
                createBaseVNode("div", _hoisted_6$1, toDisplayString(unref(spineAuthorSurname)), 1)
              ], 4),
              _cache[2] || (_cache[2] = createBaseVNode("div", { class: "book-shadow" }, null, -1))
            ], 64))
          ]),
          _: 1
        }, 8, ["to"]),
        createBaseVNode("div", _hoisted_7$1, [
          createBaseVNode("h3", _hoisted_8$1, toDisplayString(__props.book.title), 1),
          createBaseVNode("div", _hoisted_9$1, toDisplayString(__props.book.author), 1),
          createBaseVNode("div", _hoisted_10$1, [
            __props.review?.rating ? (openBlock(), createBlock(_component_RatingDisplay, {
              key: 0,
              rating: __props.review.rating,
              size: "sm"
            }, null, 8, ["rating"])) : (openBlock(), createElementBlock("span", _hoisted_11, "unrated"))
          ]),
          createBaseVNode("div", _hoisted_12, [
            createVNode(_component_StatusBadge, {
              status: __props.book.status
            }, null, 8, ["status"])
          ])
        ])
      ], 12, _hoisted_1$3);
    };
  }
});
const _hoisted_1$2 = { key: 0 };
const _hoisted_2$2 = { class: "grid grid-cols-2 items-end gap-x-6 gap-y-2 sm:grid-cols-4" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BookGrid",
  props: {
    books: {},
    reviews: {}
  },
  setup(__props) {
    const props = __props;
    const cols = ref(4);
    onMounted(() => {
      const mq = window.matchMedia("(min-width: 640px)");
      cols.value = mq.matches ? 4 : 2;
      const handler = (e) => {
        cols.value = e.matches ? 4 : 2;
      };
      mq.addEventListener("change", handler);
      onUnmounted(() => mq.removeEventListener("change", handler));
    });
    const rows = computed(
      () => Array.from(
        { length: Math.ceil(props.books.length / cols.value) },
        (_, i) => ({ books: props.books.slice(i * cols.value, (i + 1) * cols.value), startIndex: i * cols.value })
      )
    );
    return (_ctx, _cache) => {
      const _component_BookCard = _sfc_main$3;
      return __props.books.length ? (openBlock(), createElementBlock("div", _hoisted_1$2, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(rows), (row) => {
          return openBlock(), createElementBlock("div", {
            key: row.startIndex,
            class: "shelf"
          }, [
            createBaseVNode("div", _hoisted_2$2, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(row.books, (book, j) => {
                return openBlock(), createBlock(_component_BookCard, {
                  key: book.id,
                  book,
                  review: __props.reviews?.[book.id],
                  index: row.startIndex + j
                }, null, 8, ["book", "review", "index"]);
              }), 128))
            ]),
            _cache[0] || (_cache[0] = createBaseVNode("div", { class: "shelf-edge" }, null, -1))
          ]);
        }), 128))
      ])) : createCommentVNode("", true);
    };
  }
});
function useLibrary() {
  const store = useLibraryStore();
  store.init();
  const { books, reviews } = storeToRefs(store);
  return { books, reviews };
}
const _hoisted_1$1 = { class: "border-b hair pb-3.5" };
const _hoisted_2$1 = { class: "flex flex-wrap items-center justify-between gap-x-8 gap-y-4" };
const _hoisted_3$1 = { class: "flex items-center gap-5 font-sans text-[13.5px] font-medium whitespace-nowrap" };
const _hoisted_4 = ["onClick"];
const _hoisted_5 = {
  key: 0,
  class: "ml-1 font-mono text-[10px] text-faint"
};
const _hoisted_6 = { class: "flex items-center gap-3" };
const _hoisted_7 = { class: "relative" };
const _hoisted_8 = ["value"];
const _hoisted_9 = ["value"];
const _hoisted_10 = ["value"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FilterBar",
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { books: allBooks } = useLibrary();
    const genres = computed(
      () => [...new Set(allBooks.value.map((b) => b.genre).filter(Boolean))].sort()
    );
    const statusCounts = computed(() => {
      const counts = { all: allBooks.value.length };
      allBooks.value.forEach((b) => {
        counts[b.status] = (counts[b.status] ?? 0) + 1;
      });
      return counts;
    });
    const statuses = [
      { value: "all", label: "All" },
      { value: "want_to_read", label: "Want to read" },
      { value: "reading", label: "Reading" },
      { value: "read", label: "Read" },
      { value: "abandoned", label: "Abandoned" }
    ];
    function update(partial) {
      emit("update:modelValue", { ...props.modelValue, ...partial });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("nav", _hoisted_3$1, [
            (openBlock(), createElementBlock(Fragment, null, renderList(statuses, (s) => {
              return createBaseVNode("button", {
                key: s.value,
                type: "button",
                class: normalizeClass(["tab", { active: __props.modelValue.status === s.value }]),
                onClick: ($event) => update({ status: s.value })
              }, [
                createTextVNode(toDisplayString(s.label) + " ", 1),
                s.value === "all" ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(unref(statusCounts).all ?? 0), 1)) : createCommentVNode("", true)
              ], 10, _hoisted_4);
            }), 64))
          ]),
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              _cache[2] || (_cache[2] = createBaseVNode("svg", {
                class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint",
                width: "14",
                height: "14",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "1.8"
              }, [
                createBaseVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "7"
                }),
                createBaseVNode("path", { d: "m20 20-3.2-3.2" })
              ], -1)),
              createBaseVNode("input", {
                value: __props.modelValue.search,
                type: "text",
                placeholder: "Search titles, authors…",
                class: "field w-[200px] rounded-md py-2 pl-9 pr-3 font-sans text-[13px]",
                onInput: _cache[0] || (_cache[0] = ($event) => update({ search: $event.target.value }))
              }, null, 40, _hoisted_8)
            ]),
            unref(genres).length ? (openBlock(), createElementBlock("select", {
              key: 0,
              value: __props.modelValue.genre,
              class: "field cursor-pointer rounded-md py-2 pl-3 pr-7 font-sans text-[13px] text-muted",
              onChange: _cache[1] || (_cache[1] = ($event) => update({ genre: $event.target.value }))
            }, [
              _cache[3] || (_cache[3] = createBaseVNode("option", { value: "" }, "All genres", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(genres), (g) => {
                return openBlock(), createElementBlock("option", {
                  key: g,
                  value: g
                }, toDisplayString(g), 9, _hoisted_10);
              }), 128))
            ], 40, _hoisted_9)) : createCommentVNode("", true)
          ])
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "flex items-end justify-between" };
const _hoisted_2 = { class: "mt-2.5 font-mono text-[11px] uppercase tracking-[.16em] text-faint" };
const _hoisted_3 = {
  key: 0,
  class: "py-24 text-center font-serif text-[17px] italic text-faint"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const filters = ref({
      status: "all",
      genre: "",
      seriesId: "",
      tagId: "",
      sort: "dateAdded",
      search: ""
    });
    const store = useLibraryStore();
    const { books: allBooks, reviews: allReviews, bookTags: allBookTags, series: allSeries } = storeToRefs(store);
    const seriesWithNew = computed(() => allSeries.value.filter((s) => s.newReleaseAvailable));
    const reviewMap = computed(() => {
      const map = {};
      allReviews.value.forEach((r) => {
        map[r.bookId] = r;
      });
      return map;
    });
    const booksByTag = computed(() => {
      const map = {};
      allBookTags.value.forEach((bt) => {
        if (!map[bt.tagId]) map[bt.tagId] = /* @__PURE__ */ new Set();
        map[bt.tagId].add(bt.bookId);
      });
      return map;
    });
    const filteredBooks = computed(() => {
      let books = [...allBooks.value];
      const f = filters.value;
      if (f.status !== "all") books = books.filter((b) => b.status === f.status);
      if (f.genre) books = books.filter((b) => b.genre === f.genre);
      if (f.seriesId) books = books.filter((b) => b.seriesId === f.seriesId);
      if (f.tagId) {
        const ids = booksByTag.value[f.tagId] ?? /* @__PURE__ */ new Set();
        books = books.filter((b) => ids.has(b.id));
      }
      if (f.search) {
        const q = f.search.toLowerCase();
        books = books.filter(
          (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
        );
      }
      books.sort((a, b) => {
        switch (f.sort) {
          case "title":
            return a.title.localeCompare(b.title);
          case "author":
            return a.author.localeCompare(b.author);
          case "rating": {
            const ra = reviewMap.value[a.id]?.rating ?? 0;
            const rb = reviewMap.value[b.id]?.rating ?? 0;
            return rb - ra;
          }
          case "dateRead": {
            const da = reviewMap.value[a.id]?.dateRead ?? 0;
            const db2 = reviewMap.value[b.id]?.dateRead ?? 0;
            return db2 - da;
          }
          default:
            return b.dateAdded - a.dateAdded;
        }
      });
      return books;
    });
    const lastAddedDaysAgo = computed(() => {
      if (!allBooks.value.length) return null;
      const latest = allBooks.value.reduce((m, b) => b.dateAdded > m ? b.dateAdded : m, 0);
      const days = Math.floor((Date.now() - latest) / 864e5);
      if (days === 0) return "today";
      if (days === 1) return "yesterday";
      return `${days} days ago`;
    });
    const addModal = ref(null);
    function handleAdded(id) {
      nextTick(() => document.querySelector(`[data-book-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
    return (_ctx, _cache) => {
      const _component_NewReleaseBanner = _sfc_main$7;
      const _component_FilterBar = _sfc_main$1;
      const _component_BookGrid = _sfc_main$2;
      const _component_AddBookModal = _sfc_main$4;
      return openBlock(), createElementBlock("div", null, [
        createBaseVNode("header", _hoisted_1, [
          createBaseVNode("div", null, [
            _cache[2] || (_cache[2] = createBaseVNode("h1", { class: "font-serif text-[40px] font-medium leading-none tracking-tight text-bone" }, "Library", -1)),
            createBaseVNode("p", _hoisted_2, [
              createTextVNode(toDisplayString(unref(allBooks).length) + " volumes catalogued ", 1),
              lastAddedDaysAgo.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                createTextVNode(" · last added " + toDisplayString(lastAddedDaysAgo.value), 1)
              ], 64)) : createCommentVNode("", true)
            ])
          ]),
          _cache[3] || (_cache[3] = createBaseVNode("div", { class: "hidden font-mono text-[11px] text-faint sm:block" }, [
            createTextVNode("No. "),
            createBaseVNode("span", { class: "text-muted" }, "823.91")
          ], -1))
        ]),
        createVNode(_component_NewReleaseBanner, {
          series: seriesWithNew.value,
          class: "mt-7"
        }, null, 8, ["series"]),
        createVNode(_component_FilterBar, {
          modelValue: filters.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.value = $event),
          class: "mt-7"
        }, null, 8, ["modelValue"]),
        createVNode(_component_BookGrid, {
          books: filteredBooks.value,
          reviews: reviewMap.value,
          class: "mt-10"
        }, null, 8, ["books", "reviews"]),
        !filteredBooks.value.length ? (openBlock(), createElementBlock("p", _hoisted_3, " No volumes on this shelf. ")) : createCommentVNode("", true),
        _cache[5] || (_cache[5] = createBaseVNode("p", { class: "mt-2 text-center font-mono text-[10px] uppercase tracking-[.14em] text-faint/70" }, " Drop an image onto any book to set its cover ", -1)),
        createBaseVNode("button", {
          type: "button",
          class: "fab fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brass text-ink-950",
          "aria-label": "Add a book",
          onClick: _cache[1] || (_cache[1] = ($event) => addModal.value?.open())
        }, [..._cache[4] || (_cache[4] = [
          createBaseVNode("svg", {
            width: "22",
            height: "22",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.2"
          }, [
            createBaseVNode("path", { d: "M12 5v14M5 12h14" })
          ], -1)
        ])]),
        createVNode(_component_AddBookModal, {
          ref_key: "addModal",
          ref: addModal,
          onAdded: handleAdded
        }, null, 512)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
