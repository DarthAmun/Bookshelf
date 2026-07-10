import { _ as _sfc_main$2 } from "./StatusBadge.vue_vue_type_script_setup_true_lang-vBhcZSrA.js";
import { _ as _sfc_main$1 } from "./CoverImage.vue_vue_type_script_setup_true_lang-CHLHa5nF.js";
import { d as defineComponent, u as useLibraryStore, C as watch, e as createElementBlock, f as createBaseVNode, x as createVNode, y as withCtx, t as toDisplayString, j as createCommentVNode, k as withDirectives, v as vModelText, F as Fragment, r as renderList, E as useRoute, p as computed, q as ref, z as resolveComponent, B as useRouter, b as openBlock, c as createBlock, m as createTextVNode } from "./index-vRGsP6Kw.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
import { u as useSeries } from "./useSeries-C62YMXa0.js";
const _hoisted_1 = {
  key: 0,
  class: "max-w-2xl mx-auto space-y-6"
};
const _hoisted_2 = { class: "flex items-center gap-3" };
const _hoisted_3 = { class: "flex-1 min-w-0" };
const _hoisted_4 = { class: "font-serif text-[28px] font-medium text-bone" };
const _hoisted_5 = { class: "text-sm text-muted" };
const _hoisted_6 = { class: "flex items-center gap-2" };
const _hoisted_7 = ["disabled"];
const _hoisted_8 = {
  key: 0,
  class: "bg-ink-850 rounded-xl border hair p-4 space-y-3"
};
const _hoisted_9 = { class: "grid grid-cols-1 md:grid-cols-2 gap-3" };
const _hoisted_10 = { class: "col-span-2" };
const _hoisted_11 = { class: "space-y-2" };
const _hoisted_12 = { class: "space-y-2" };
const _hoisted_13 = { class: "text-sm font-medium text-faint w-6 text-center flex-shrink-0" };
const _hoisted_14 = { class: "flex-1 min-w-0" };
const _hoisted_15 = { class: "font-medium text-sm text-bone truncate" };
const _hoisted_16 = { class: "text-sm font-medium text-faint w-6 text-center flex-shrink-0" };
const _hoisted_17 = { class: "border-t hair pt-4" };
const _hoisted_18 = {
  key: 1,
  class: "flex items-center gap-3"
};
const _hoisted_19 = { class: "text-sm text-muted" };
const _hoisted_20 = {
  key: 1,
  class: "text-center py-20 text-faint"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    const store = useLibraryStore();
    const series = computed(() => store.series.find((s) => s.id === id));
    const seriesBooks = computed(() => store.books.filter((b) => b.seriesId === id));
    useHead(() => ({ title: series.value ? `${series.value.name} — Bookshelf` : "Series — Bookshelf" }));
    const { updateSeries, deleteSeries } = useSeries();
    const editing = ref(false);
    const editData = ref({});
    watch(series, (s) => {
      if (s) {
        editData.value = {
          knownTotal: s.knownTotal,
          amazonUrl: s.amazonUrl,
          nextBookTitle: s.nextBookTitle,
          nextBookDate: s.nextBookDate
        };
      }
    }, { immediate: true });
    async function saveEdit() {
      await updateSeries(id, editData.value);
      editing.value = false;
    }
    const checkingNow = ref(false);
    async function checkNow() {
      if (!series.value?.amazonUrl) return;
      checkingNow.value = true;
      try {
        const result = await window.bookshelf.scrapeSeries(series.value.amazonUrl);
        if (!result.error && result.books.length) {
          const existingAsins = new Set(seriesBooks.value.map((b) => b.asin).filter(Boolean));
          const newBooks = result.books.filter((b) => b.asin && !existingAsins.has(b.asin));
          const hasNew = newBooks.length > 0;
          const nextBook = newBooks.sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))[0];
          await window.bookshelf.updateSeries(id, {
            lastChecked: Date.now(),
            newReleaseAvailable: hasNew || (series.value?.newReleaseAvailable ?? false),
            nextBookTitle: nextBook?.title ?? series.value?.nextBookTitle,
            nextBookDate: nextBook?.publishedDate ?? series.value?.nextBookDate,
            knownTotal: result.totalBooks ?? series.value?.knownTotal
          });
          await store.loadSeries();
        }
      } finally {
        checkingNow.value = false;
      }
    }
    async function handleDelete() {
      await deleteSeries(id);
      router.push("/series");
    }
    const sortedBooks = computed(
      () => [...seriesBooks.value].sort((a, b) => (a.seriesPosition ?? 999) - (b.seriesPosition ?? 999))
    );
    const placeholders = computed(() => {
      const total = series.value?.knownTotal ?? 0;
      const have = seriesBooks.value.length;
      return Math.max(0, total - have);
    });
    const showDeleteConfirm = ref(false);
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_CoverImage = _sfc_main$1;
      const _component_StatusBadge = _sfc_main$2;
      return series.value ? (openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_RouterLink, {
            to: "/series",
            class: "text-faint hover:text-muted"
          }, {
            default: withCtx(() => [..._cache[7] || (_cache[7] = [
              createBaseVNode("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                class: "w-5 h-5",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor"
              }, [
                createBaseVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M15 19l-7-7 7-7"
                })
              ], -1)
            ])]),
            _: 1
          }),
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("h1", _hoisted_4, toDisplayString(series.value.name), 1),
            createBaseVNode("p", _hoisted_5, toDisplayString(series.value.author), 1)
          ]),
          createBaseVNode("div", _hoisted_6, [
            series.value.amazonUrl ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              disabled: checkingNow.value,
              class: "px-3 py-1.5 text-sm border border-white/10 rounded-lg text-muted hover:text-bone hover:bg-ink-800 disabled:opacity-60 transition-colors",
              onClick: checkNow
            }, toDisplayString(checkingNow.value ? "Checking…" : "Check now"), 9, _hoisted_7)) : createCommentVNode("", true),
            createBaseVNode("button", {
              type: "button",
              class: "text-sm text-brass hover:text-brass-soft",
              onClick: _cache[0] || (_cache[0] = ($event) => editing.value = !editing.value)
            }, toDisplayString(editing.value ? "Cancel" : "Edit"), 1)
          ])
        ]),
        editing.value ? (openBlock(), createElementBlock("div", _hoisted_8, [
          _cache[12] || (_cache[12] = createBaseVNode("h2", { class: "lbl" }, "Series settings", -1)),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode("div", null, [
              _cache[8] || (_cache[8] = createBaseVNode("label", { class: "lbl block mb-1" }, "Total books known", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => editData.value.knownTotal = $event),
                type: "number",
                min: "0",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [
                  vModelText,
                  editData.value.knownTotal,
                  void 0,
                  { number: true }
                ]
              ])
            ]),
            createBaseVNode("div", null, [
              _cache[9] || (_cache[9] = createBaseVNode("label", { class: "lbl block mb-1" }, "Next book title", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => editData.value.nextBookTitle = $event),
                type: "text",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [vModelText, editData.value.nextBookTitle]
              ])
            ]),
            createBaseVNode("div", _hoisted_10, [
              _cache[10] || (_cache[10] = createBaseVNode("label", { class: "lbl block mb-1" }, "Amazon series URL", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => editData.value.amazonUrl = $event),
                type: "url",
                placeholder: "https://www.amazon.de/dp/…",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [vModelText, editData.value.amazonUrl]
              ])
            ]),
            createBaseVNode("div", null, [
              _cache[11] || (_cache[11] = createBaseVNode("label", { class: "lbl block mb-1" }, "Next book expected date", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => editData.value.nextBookDate = $event),
                type: "text",
                placeholder: "2025 or 2025-06-01",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [vModelText, editData.value.nextBookDate]
              ])
            ])
          ]),
          createBaseVNode("button", {
            type: "button",
            class: "addbtn px-4 py-2 rounded-lg text-sm font-medium",
            onClick: saveEdit
          }, " Save changes ")
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_11, [
          _cache[15] || (_cache[15] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Books in series", -1)),
          createBaseVNode("div", _hoisted_12, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(sortedBooks.value, (book) => {
              return openBlock(), createBlock(_component_RouterLink, {
                key: book.id,
                to: `/book/${book.id}`,
                class: "flex items-center gap-3 p-3 bg-ink-850 rounded-lg border hair hover:bg-ink-800 transition-colors"
              }, {
                default: withCtx(() => [
                  createBaseVNode("span", _hoisted_13, toDisplayString(book.seriesPosition ?? "?"), 1),
                  createVNode(_component_CoverImage, {
                    src: book.coverUrl,
                    alt: book.title,
                    class: "w-10 h-14 flex-shrink-0 rounded"
                  }, null, 8, ["src", "alt"]),
                  createBaseVNode("div", _hoisted_14, [
                    createBaseVNode("p", _hoisted_15, toDisplayString(book.title), 1),
                    createVNode(_component_StatusBadge, {
                      status: book.status
                    }, null, 8, ["status"])
                  ])
                ]),
                _: 2
              }, 1032, ["to"]);
            }), 128)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(placeholders.value, (n) => {
              return openBlock(), createElementBlock("div", {
                key: `placeholder-${n}`,
                class: "flex items-center gap-3 p-3 bg-ink-800/40 rounded-lg border border-dashed border-white/10 opacity-60"
              }, [
                createBaseVNode("span", _hoisted_16, toDisplayString(sortedBooks.value.length + n), 1),
                _cache[13] || (_cache[13] = createBaseVNode("div", { class: "w-10 h-14 bg-ink-750 rounded flex-shrink-0" }, null, -1)),
                _cache[14] || (_cache[14] = createBaseVNode("p", { class: "text-sm text-faint" }, "Unread / upcoming", -1))
              ]);
            }), 128))
          ])
        ]),
        createBaseVNode("div", _hoisted_17, [
          !showDeleteConfirm.value ? (openBlock(), createElementBlock("button", {
            key: 0,
            type: "button",
            class: "text-sm text-red-400 hover:text-red-300",
            onClick: _cache[5] || (_cache[5] = ($event) => showDeleteConfirm.value = true)
          }, " Delete series ")) : (openBlock(), createElementBlock("div", _hoisted_18, [
            createBaseVNode("p", _hoisted_19, 'Remove "' + toDisplayString(series.value.name) + '" from tracking?', 1),
            createBaseVNode("button", {
              type: "button",
              class: "px-3 py-1.5 bg-red-700 hover:bg-red-600 text-bone rounded-lg text-sm font-medium",
              onClick: handleDelete
            }, "Delete"),
            createBaseVNode("button", {
              type: "button",
              class: "text-sm text-muted hover:text-bone",
              onClick: _cache[6] || (_cache[6] = ($event) => showDeleteConfirm.value = false)
            }, "Cancel")
          ]))
        ])
      ])) : (openBlock(), createElementBlock("div", _hoisted_20, [
        _cache[17] || (_cache[17] = createBaseVNode("p", null, "Series not found.", -1)),
        createVNode(_component_RouterLink, {
          to: "/series",
          class: "mt-2 text-brass hover:text-brass-soft text-sm"
        }, {
          default: withCtx(() => [..._cache[16] || (_cache[16] = [
            createTextVNode("← Back to series", -1)
          ])]),
          _: 1
        })
      ]));
    };
  }
});
export {
  _sfc_main as default
};
