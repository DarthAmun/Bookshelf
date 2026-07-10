import { _ as _sfc_main$2 } from "./RatingDisplay.vue_vue_type_script_setup_true_lang-CRaTVsLZ.js";
import { d as defineComponent, e as createElementBlock, F as Fragment, r as renderList, b as openBlock, f as createBaseVNode, t as toDisplayString, g as normalizeStyle, i as unref, p as computed, u as useLibraryStore, A as storeToRefs, x as createVNode, j as createCommentVNode, y as withCtx, m as createTextVNode, z as resolveComponent } from "./index-vRGsP6Kw.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
const _hoisted_1$1 = {
  key: 0,
  class: "space-y-2"
};
const _hoisted_2$1 = { class: "text-xs text-faint w-28 truncate flex-shrink-0 text-right" };
const _hoisted_3$1 = { class: "flex-1 bg-ink-800 rounded-full h-4 overflow-hidden" };
const _hoisted_4$1 = { class: "text-xs font-medium text-muted w-6 flex-shrink-0" };
const _hoisted_5$1 = {
  key: 1,
  class: "flex items-end gap-2 h-32"
};
const _hoisted_6$1 = { class: "text-xs text-muted font-medium" };
const _hoisted_7$1 = { class: "text-xs text-faint truncate max-w-full" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "StatsChart",
  props: {
    data: {},
    type: {}
  },
  setup(__props) {
    const props = __props;
    const max = computed(() => Math.max(...props.data.map((d) => d.value), 1));
    return (_ctx, _cache) => {
      return __props.type === "horizontal-bar" ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.data, (item) => {
          return openBlock(), createElementBlock("div", {
            key: item.label,
            class: "flex items-center gap-3"
          }, [
            createBaseVNode("span", _hoisted_2$1, toDisplayString(item.label), 1),
            createBaseVNode("div", _hoisted_3$1, [
              createBaseVNode("div", {
                class: "h-full bg-brass rounded-full transition-all duration-500",
                style: normalizeStyle({ width: `${item.value / unref(max) * 100}%` })
              }, null, 4)
            ]),
            createBaseVNode("span", _hoisted_4$1, toDisplayString(item.value), 1)
          ]);
        }), 128))
      ])) : (openBlock(), createElementBlock("div", _hoisted_5$1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.data, (item) => {
          return openBlock(), createElementBlock("div", {
            key: item.label,
            class: "flex flex-col items-center gap-1 flex-1"
          }, [
            createBaseVNode("span", _hoisted_6$1, toDisplayString(item.value), 1),
            createBaseVNode("div", {
              class: "w-full bg-brass rounded-t transition-all duration-500 min-h-1",
              style: normalizeStyle({ height: `${item.value / unref(max) * 96}px` })
            }, null, 4),
            createBaseVNode("span", _hoisted_7$1, toDisplayString(item.label), 1)
          ]);
        }), 128))
      ]));
    };
  }
});
const _hoisted_1 = { class: "space-y-8 max-w-3xl mx-auto" };
const _hoisted_2 = { class: "grid grid-cols-2 md:grid-cols-4 gap-4" };
const _hoisted_3 = { class: "bg-ink-850 rounded-xl border hair p-4 text-center" };
const _hoisted_4 = { class: "text-3xl font-bold text-brass" };
const _hoisted_5 = { class: "bg-ink-850 rounded-xl border hair p-4 text-center" };
const _hoisted_6 = { class: "text-3xl font-bold text-brass" };
const _hoisted_7 = { class: "bg-ink-850 rounded-xl border hair p-4 text-center" };
const _hoisted_8 = { class: "text-3xl font-bold text-brass-soft" };
const _hoisted_9 = { class: "bg-ink-850 rounded-xl border hair p-4 text-center" };
const _hoisted_10 = { class: "text-3xl font-bold text-brass" };
const _hoisted_11 = { class: "bg-ink-850 rounded-xl border hair p-5 space-y-3" };
const _hoisted_12 = {
  key: 0,
  class: "bg-ink-850 rounded-xl border hair p-5 space-y-3"
};
const _hoisted_13 = {
  key: 1,
  class: "bg-ink-850 rounded-xl border hair p-5 space-y-3"
};
const _hoisted_14 = { class: "space-y-2" };
const _hoisted_15 = { class: "text-sm font-bold text-faint w-4" };
const _hoisted_16 = {
  key: 2,
  class: "bg-ink-850 rounded-xl border hair p-5 space-y-3"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "stats",
  setup(__props) {
    useHead({ title: "Stats — Bookshelf" });
    const store = useLibraryStore();
    const { books, reviews, series } = storeToRefs(store);
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const booksRead = computed(() => books.value.filter((b) => b.status === "read").length);
    const booksThisYear = computed(
      () => reviews.value.filter((r) => r.dateRead && new Date(r.dateRead).getFullYear() === currentYear).length
    );
    const avgRating = computed(() => {
      const rated = reviews.value.filter((r) => r.rating);
      if (!rated.length) return null;
      return (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1);
    });
    const topBooks = computed(
      () => reviews.value.filter((r) => r.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5).map((r) => ({ book: books.value.find((b) => b.id === r.bookId), rating: r.rating })).filter((x) => x.book)
    );
    const monthlyPace = computed(() => {
      const map = {};
      reviews.value.forEach((r) => {
        if (!r.dateRead) return;
        const d = new Date(r.dateRead);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map[key] = (map[key] ?? 0) + 1;
      });
      return Array.from({ length: 12 }, (_, i) => {
        const d = /* @__PURE__ */ new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return { label: d.toLocaleDateString("en-US", { month: "short" }), value: map[key] ?? 0 };
      });
    });
    const genreBreakdown = computed(() => {
      const map = {};
      books.value.forEach((b) => {
        if (!b.genre) return;
        map[b.genre] = (map[b.genre] ?? 0) + 1;
      });
      return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10).map(([label, value]) => ({ label, value }));
    });
    const seriesCompletion = computed(
      () => series.value.filter((s) => s.knownTotal && s.knownTotal > 0).map((s) => {
        const read = books.value.filter((b) => b.seriesId === s.id && b.status === "read").length;
        return { label: s.name, value: Math.round(read / (s.knownTotal ?? 1) * 100) };
      }).sort((a, b) => b.value - a.value)
    );
    return (_ctx, _cache) => {
      const _component_StatsChart = _sfc_main$1;
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_RatingDisplay = _sfc_main$2;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[9] || (_cache[9] = createBaseVNode("h1", { class: "font-serif text-[28px] font-medium text-bone" }, "Reading stats", -1)),
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, toDisplayString(booksRead.value), 1),
            _cache[0] || (_cache[0] = createBaseVNode("div", { class: "text-xs text-faint mt-1" }, "Books read (all time)", -1))
          ]),
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("div", _hoisted_6, toDisplayString(booksThisYear.value), 1),
            _cache[1] || (_cache[1] = createBaseVNode("div", { class: "text-xs text-faint mt-1" }, "Books read this year", -1))
          ]),
          createBaseVNode("div", _hoisted_7, [
            createBaseVNode("div", _hoisted_8, toDisplayString(avgRating.value ?? "—"), 1),
            _cache[2] || (_cache[2] = createBaseVNode("div", { class: "text-xs text-faint mt-1" }, "Avg rating", -1))
          ]),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode("div", _hoisted_10, toDisplayString(unref(books).length), 1),
            _cache[3] || (_cache[3] = createBaseVNode("div", { class: "text-xs text-faint mt-1" }, "Total in library", -1))
          ])
        ]),
        createBaseVNode("div", _hoisted_11, [
          _cache[4] || (_cache[4] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Books per month (last 12 months)", -1)),
          createVNode(_component_StatsChart, {
            data: monthlyPace.value,
            type: "bar"
          }, null, 8, ["data"])
        ]),
        genreBreakdown.value.length ? (openBlock(), createElementBlock("div", _hoisted_12, [
          _cache[5] || (_cache[5] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Genre breakdown", -1)),
          createVNode(_component_StatsChart, {
            data: genreBreakdown.value,
            type: "horizontal-bar"
          }, null, 8, ["data"])
        ])) : createCommentVNode("", true),
        topBooks.value.length ? (openBlock(), createElementBlock("div", _hoisted_13, [
          _cache[6] || (_cache[6] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Top 5 rated", -1)),
          createBaseVNode("ol", _hoisted_14, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(topBooks.value, (item, i) => {
              return openBlock(), createElementBlock("li", {
                key: i,
                class: "flex items-center gap-3"
              }, [
                createBaseVNode("span", _hoisted_15, toDisplayString(i + 1), 1),
                createVNode(_component_RouterLink, {
                  to: `/book/${item.book.id}`,
                  class: "flex-1 text-sm text-bone hover:underline truncate"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.book.title), 1)
                  ]),
                  _: 2
                }, 1032, ["to"]),
                createVNode(_component_RatingDisplay, {
                  rating: item.rating,
                  size: "sm"
                }, null, 8, ["rating"])
              ]);
            }), 128))
          ])
        ])) : createCommentVNode("", true),
        seriesCompletion.value.length ? (openBlock(), createElementBlock("div", _hoisted_16, [
          _cache[7] || (_cache[7] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Series completion", -1)),
          createVNode(_component_StatsChart, {
            data: seriesCompletion.value,
            type: "horizontal-bar"
          }, null, 8, ["data"]),
          _cache[8] || (_cache[8] = createBaseVNode("p", { class: "text-xs text-faint" }, "Showing % of known total read", -1))
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
