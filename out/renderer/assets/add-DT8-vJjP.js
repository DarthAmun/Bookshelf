import { _ as _sfc_main$1 } from "./CoverImage.vue_vue_type_script_setup_true_lang-CHLHa5nF.js";
import { d as defineComponent, e as createElementBlock, f as createBaseVNode, x as createVNode, y as withCtx, k as withDirectives, v as vModelText, l as withKeys, t as toDisplayString, j as createCommentVNode, F as Fragment, r as renderList, q as ref, p as computed, z as resolveComponent, B as useRouter, b as openBlock, h as normalizeClass, D as vModelCheckbox, m as createTextVNode } from "./index-vRGsP6Kw.js";
import { a as addBook } from "./useBooks-DEAcE43j.js";
import { f as findSeriesByName, a as addSeries } from "./useSeries-C62YMXa0.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
const _hoisted_1 = { class: "max-w-2xl mx-auto space-y-6" };
const _hoisted_2 = { class: "flex items-center gap-3" };
const _hoisted_3 = { class: "bg-ink-850 rounded-xl border hair p-4 space-y-3" };
const _hoisted_4 = { class: "flex gap-2" };
const _hoisted_5 = ["disabled"];
const _hoisted_6 = {
  key: 0,
  class: "text-sm text-red-400"
};
const _hoisted_7 = {
  key: 0,
  class: "space-y-4"
};
const _hoisted_8 = { class: "grid grid-cols-2 gap-3" };
const _hoisted_9 = { class: "flex items-center justify-between" };
const _hoisted_10 = { class: "text-sm text-muted" };
const _hoisted_11 = { class: "flex gap-2 text-sm" };
const _hoisted_12 = { class: "space-y-2" };
const _hoisted_13 = ["onUpdate:modelValue"];
const _hoisted_14 = { class: "min-w-0 flex-1" };
const _hoisted_15 = { class: "flex items-center gap-2" };
const _hoisted_16 = { class: "text-sm font-medium text-bone truncate" };
const _hoisted_17 = {
  key: 0,
  class: "flex-shrink-0 text-xs text-brass-soft bg-brass-dim/20 px-1.5 py-0.5 rounded"
};
const _hoisted_18 = {
  key: 1,
  class: "flex-shrink-0 text-xs text-[#d8b56e] bg-[#d8b56e]/10 px-1.5 py-0.5 rounded"
};
const _hoisted_19 = {
  key: 2,
  class: "flex-shrink-0 text-xs text-[#9bc093] bg-[#9bc093]/10 px-1.5 py-0.5 rounded"
};
const _hoisted_20 = { class: "flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1" };
const _hoisted_21 = {
  key: 0,
  class: "font-mono text-[10px] text-faint"
};
const _hoisted_22 = {
  key: 1,
  class: "text-xs text-faint"
};
const _hoisted_23 = {
  key: 2,
  class: "text-xs text-[#9bc093]"
};
const _hoisted_24 = {
  key: 3,
  class: "text-xs text-brass-soft truncate"
};
const _hoisted_25 = {
  key: 4,
  class: "text-xs text-faint italic"
};
const _hoisted_26 = { class: "flex gap-2 pt-2" };
const _hoisted_27 = ["disabled"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "add",
  setup(__props) {
    useHead({ title: "Import Series — Bookshelf" });
    const router = useRouter();
    const amazonUrl = ref("");
    const scraping = ref(false);
    const scrapeError = ref("");
    const scrapedData = ref(null);
    async function handleScrape() {
      const url = amazonUrl.value.trim();
      if (!url) return;
      scraping.value = true;
      scrapeError.value = "";
      scrapedData.value = null;
      try {
        const result = await window.bookshelf.scrapeSeries(url);
        if (result.error) {
          scrapeError.value = result.error;
          return;
        }
        if (!result.books.length) {
          scrapeError.value = "No books found on this page. Make sure it is an Amazon series page URL.";
          return;
        }
        scrapedData.value = {
          seriesName: result.seriesName ?? "",
          author: result.author ?? "",
          books: result.books.map((b) => ({ ...b, selected: true }))
        };
      } finally {
        scraping.value = false;
      }
    }
    function bookStatus(book) {
      if (book.currentlyBorrowed) return "reading";
      if (book.postPurchaseMessage) return "read";
      return "want_to_read";
    }
    const selectedCount = computed(() => scrapedData.value?.books.filter((b) => b.selected).length ?? 0);
    const importing = ref(false);
    async function handleImport() {
      const data = scrapedData.value;
      if (!data) return;
      const selected = data.books.filter((b) => b.selected);
      if (!selected.length) return;
      importing.value = true;
      try {
        let series = await findSeriesByName(data.seriesName);
        if (!series) {
          series = await addSeries({
            name: data.seriesName,
            author: data.author,
            knownTotal: selected.length,
            amazonUrl: amazonUrl.value,
            newReleaseAvailable: false
          });
        }
        for (const book of selected) {
          await addBook({
            title: book.title,
            author: data.author,
            coverUrl: book.coverUrl,
            asin: book.asin,
            amazonUrl: `https://www.amazon.de/dp/${book.asin}`,
            publishedDate: book.publishedDate ?? book.releaseDate,
            seriesId: series.id,
            seriesPosition: book.seriesPosition,
            status: bookStatus(book)
          });
        }
        router.push(`/series/${series.id}`);
      } finally {
        importing.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_CoverImage = _sfc_main$1;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_RouterLink, {
            to: "/series",
            class: "text-faint hover:text-muted"
          }, {
            default: withCtx(() => [..._cache[5] || (_cache[5] = [
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
          _cache[6] || (_cache[6] = createBaseVNode("h1", { class: "font-serif text-[28px] font-medium text-bone" }, "Import series", -1))
        ]),
        createBaseVNode("div", _hoisted_3, [
          _cache[7] || (_cache[7] = createBaseVNode("p", { class: "text-sm text-muted" }, "Paste an Amazon series page URL to import the full book list.", -1)),
          createBaseVNode("div", _hoisted_4, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => amazonUrl.value = $event),
              type: "url",
              placeholder: "https://www.amazon.de/dp/…?binding=kindle_edition",
              class: "field flex-1 px-3 py-2 rounded-lg text-sm",
              onKeydown: withKeys(handleScrape, ["enter"])
            }, null, 544), [
              [vModelText, amazonUrl.value]
            ]),
            createBaseVNode("button", {
              type: "button",
              disabled: scraping.value || !amazonUrl.value,
              class: "addbtn px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60",
              onClick: handleScrape
            }, toDisplayString(scraping.value ? "Fetching…" : "Import"), 9, _hoisted_5)
          ]),
          scrapeError.value ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(scrapeError.value), 1)) : createCommentVNode("", true)
        ]),
        scrapedData.value ? (openBlock(), createElementBlock("div", _hoisted_7, [
          createBaseVNode("div", _hoisted_8, [
            createBaseVNode("div", null, [
              _cache[8] || (_cache[8] = createBaseVNode("label", { class: "lbl block mb-1" }, "Series name", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => scrapedData.value.seriesName = $event),
                type: "text",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [vModelText, scrapedData.value.seriesName]
              ])
            ]),
            createBaseVNode("div", null, [
              _cache[9] || (_cache[9] = createBaseVNode("label", { class: "lbl block mb-1" }, "Author", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => scrapedData.value.author = $event),
                type: "text",
                class: "field w-full px-3 py-2 rounded-lg text-sm"
              }, null, 512), [
                [vModelText, scrapedData.value.author]
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode("p", _hoisted_10, " Found " + toDisplayString(scrapedData.value.books.length) + " books — " + toDisplayString(selectedCount.value) + " selected ", 1),
            createBaseVNode("div", _hoisted_11, [
              createBaseVNode("button", {
                type: "button",
                class: "text-faint hover:text-muted",
                onClick: _cache[3] || (_cache[3] = ($event) => scrapedData.value.books.forEach((b) => b.selected = true))
              }, " All "),
              _cache[10] || (_cache[10] = createBaseVNode("span", { class: "text-faint" }, "·", -1)),
              createBaseVNode("button", {
                type: "button",
                class: "text-faint hover:text-muted",
                onClick: _cache[4] || (_cache[4] = ($event) => scrapedData.value.books.forEach((b) => b.selected = false))
              }, " None ")
            ])
          ]),
          createBaseVNode("div", _hoisted_12, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(scrapedData.value.books, (book, i) => {
              return openBlock(), createElementBlock("label", {
                key: i,
                class: normalizeClass(["flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", book.selected ? "border-brass/40 bg-ink-850" : "border-white/8 bg-ink-850/50 opacity-60"])
              }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => book.selected = $event,
                  type: "checkbox",
                  class: "accent-brass w-4 h-4 flex-shrink-0"
                }, null, 8, _hoisted_13), [
                  [vModelCheckbox, book.selected]
                ]),
                createVNode(_component_CoverImage, {
                  src: book.coverUrl,
                  alt: book.title,
                  class: "w-9 h-12 flex-shrink-0 rounded"
                }, null, 8, ["src", "alt"]),
                createBaseVNode("div", _hoisted_14, [
                  createBaseVNode("div", _hoisted_15, [
                    createBaseVNode("p", _hoisted_16, toDisplayString(book.title), 1),
                    book.seriesPosition ? (openBlock(), createElementBlock("span", _hoisted_17, "#" + toDisplayString(book.seriesPosition), 1)) : createCommentVNode("", true),
                    book.currentlyBorrowed ? (openBlock(), createElementBlock("span", _hoisted_18, "reading")) : book.postPurchaseMessage ? (openBlock(), createElementBlock("span", _hoisted_19, "read")) : createCommentVNode("", true)
                  ]),
                  createBaseVNode("div", _hoisted_20, [
                    book.asin ? (openBlock(), createElementBlock("span", _hoisted_21, toDisplayString(book.asin), 1)) : createCommentVNode("", true),
                    book.publishedDate ? (openBlock(), createElementBlock("span", _hoisted_22, toDisplayString(book.publishedDate), 1)) : book.releaseDate ? (openBlock(), createElementBlock("span", _hoisted_23, "Releases " + toDisplayString(book.releaseDate), 1)) : createCommentVNode("", true),
                    book.postPurchaseMessage ? (openBlock(), createElementBlock("span", _hoisted_24, toDisplayString(book.postPurchaseMessage), 1)) : createCommentVNode("", true),
                    !book.coverUrl ? (openBlock(), createElementBlock("span", _hoisted_25, "no cover")) : createCommentVNode("", true)
                  ])
                ])
              ], 2);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_26, [
            createBaseVNode("button", {
              type: "button",
              disabled: importing.value || selectedCount.value === 0,
              class: "addbtn px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60",
              onClick: handleImport
            }, toDisplayString(importing.value ? "Importing…" : `Import ${selectedCount.value} book${selectedCount.value === 1 ? "" : "s"}`), 9, _hoisted_27),
            createVNode(_component_RouterLink, {
              to: "/series",
              class: "px-4 py-2 text-sm text-muted hover:text-bone"
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode(" Cancel ", -1)
              ])]),
              _: 1
            })
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
