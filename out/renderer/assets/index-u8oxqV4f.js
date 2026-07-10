import { d as defineComponent, b as openBlock, c as createBlock, y as withCtx, f as createBaseVNode, t as toDisplayString, e as createElementBlock, j as createCommentVNode, m as createTextVNode, z as resolveComponent, u as useLibraryStore, A as storeToRefs, C as watch, x as createVNode, k as withDirectives, v as vModelText, i as unref, F as Fragment, r as renderList, p as computed, q as ref } from "./index-vRGsP6Kw.js";
import { _ as _sfc_main$2 } from "./NewReleaseBanner.vue_vue_type_script_setup_true_lang-B6I3_5-S.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
import { u as useSeries } from "./useSeries-C62YMXa0.js";
const _hoisted_1$1 = { class: "min-w-0" };
const _hoisted_2$1 = { class: "flex items-center gap-2" };
const _hoisted_3$1 = { class: "font-semibold text-bone truncate" };
const _hoisted_4$1 = {
  key: 0,
  class: "flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brass/20 text-brass"
};
const _hoisted_5$1 = { class: "text-sm text-muted" };
const _hoisted_6$1 = {
  key: 0,
  class: "mt-1 text-xs text-brass"
};
const _hoisted_7$1 = { key: 0 };
const _hoisted_8$1 = { class: "flex-shrink-0 text-sm font-medium text-muted" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SeriesRow",
  props: {
    series: {},
    progress: {}
  },
  setup(__props) {
    function formatDate(dateStr) {
      if (!dateStr) return "";
      if (dateStr.length === 4) return `~${dateStr}`;
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    }
    return (_ctx, _cache) => {
      const _component_NuxtLink = resolveComponent("NuxtLink");
      return openBlock(), createBlock(_component_NuxtLink, {
        to: `/series/${__props.series.id}`,
        class: "flex items-center justify-between gap-4 p-4 bg-ink-850 rounded-xl border hair hover:bg-ink-800 transition-colors"
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1$1, [
            createBaseVNode("div", _hoisted_2$1, [
              createBaseVNode("h3", _hoisted_3$1, toDisplayString(__props.series.name), 1),
              __props.series.newReleaseAvailable ? (openBlock(), createElementBlock("span", _hoisted_4$1, " New! ")) : createCommentVNode("", true)
            ]),
            createBaseVNode("p", _hoisted_5$1, toDisplayString(__props.series.author), 1),
            __props.series.newReleaseAvailable && __props.series.nextBookTitle ? (openBlock(), createElementBlock("div", _hoisted_6$1, [
              createTextVNode(' "' + toDisplayString(__props.series.nextBookTitle) + '" ', 1),
              __props.series.nextBookDate ? (openBlock(), createElementBlock("span", _hoisted_7$1, "(" + toDisplayString(formatDate(__props.series.nextBookDate)) + ")", 1)) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ]),
          createBaseVNode("div", _hoisted_8$1, toDisplayString(__props.progress.read) + " / " + toDisplayString(__props.progress.total) + " read ", 1)
        ]),
        _: 1
      }, 8, ["to"]);
    };
  }
});
const _hoisted_1 = { class: "space-y-6" };
const _hoisted_2 = { class: "flex items-center justify-between" };
const _hoisted_3 = { class: "flex gap-2" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = {
  key: 0,
  class: "bg-ink-850 rounded-xl border hair p-4 space-y-3"
};
const _hoisted_6 = { class: "grid grid-cols-1 md:grid-cols-2 gap-3" };
const _hoisted_7 = { class: "flex gap-2" };
const _hoisted_8 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_9 = {
  key: 2,
  class: "text-center py-20 text-faint"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    useHead({ title: "Series — Bookshelf" });
    const { addSeries, seriesList } = useSeries();
    const store = useLibraryStore();
    const { series } = storeToRefs(store);
    const seriesWithNew = computed(() => series.value.filter((s) => s.newReleaseAvailable));
    const progresses = ref({});
    watch(seriesList, async (list) => {
      const { getSeriesProgress } = useSeries();
      for (const s of list) {
        progresses.value[s.id] = await getSeriesProgress(s.id);
      }
    }, { immediate: true, deep: true });
    const refreshing = ref(false);
    async function refreshAll() {
      refreshing.value = true;
      try {
        await window.bookshelf.checkAllSeries();
        await store.loadSeries();
      } finally {
        refreshing.value = false;
      }
    }
    const showAddForm = ref(false);
    const newSeries = ref({ newReleaseAvailable: false });
    async function handleAddSeries() {
      if (!newSeries.value.name || !newSeries.value.author) return;
      await addSeries({
        ...newSeries.value,
        name: newSeries.value.name,
        author: newSeries.value.author,
        newReleaseAvailable: false
      });
      showAddForm.value = false;
      newSeries.value = { newReleaseAvailable: false };
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_NewReleaseBanner = _sfc_main$2;
      const _component_SeriesRow = _sfc_main$1;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[7] || (_cache[7] = createBaseVNode("h1", { class: "font-serif text-[28px] font-medium text-bone" }, "Series", -1)),
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("button", {
              type: "button",
              disabled: refreshing.value,
              class: "px-3 py-1.5 text-sm text-muted border border-white/10 rounded-lg hover:bg-ink-800 disabled:opacity-60 transition-colors",
              onClick: refreshAll
            }, toDisplayString(refreshing.value ? "Checking…" : "Refresh all"), 9, _hoisted_4),
            createVNode(_component_RouterLink, {
              to: "/series/add",
              class: "addbtn px-3 py-1.5 text-sm rounded-lg font-medium"
            }, {
              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                createTextVNode(" + Import series ", -1)
              ])]),
              _: 1
            }),
            createBaseVNode("button", {
              type: "button",
              class: "px-3 py-1.5 text-sm rounded-lg font-medium border border-white/10 text-muted hover:text-bone hover:bg-ink-800 transition-colors",
              onClick: _cache[0] || (_cache[0] = ($event) => showAddForm.value = !showAddForm.value)
            }, " + Add manually ")
          ])
        ]),
        createVNode(_component_NewReleaseBanner, { series: seriesWithNew.value }, null, 8, ["series"]),
        showAddForm.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
          _cache[8] || (_cache[8] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Add new series", -1)),
          createBaseVNode("div", _hoisted_6, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newSeries.value.name = $event),
              type: "text",
              placeholder: "Series name",
              class: "field px-3 py-2 rounded-lg text-sm"
            }, null, 512), [
              [vModelText, newSeries.value.name]
            ]),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => newSeries.value.author = $event),
              type: "text",
              placeholder: "Author",
              class: "field px-3 py-2 rounded-lg text-sm"
            }, null, 512), [
              [vModelText, newSeries.value.author]
            ]),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => newSeries.value.amazonUrl = $event),
              type: "url",
              placeholder: "Amazon series URL (optional)",
              class: "field px-3 py-2 rounded-lg text-sm col-span-2"
            }, null, 512), [
              [vModelText, newSeries.value.amazonUrl]
            ]),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => newSeries.value.knownTotal = $event),
              type: "number",
              min: "1",
              placeholder: "Total books (optional)",
              class: "field px-3 py-2 rounded-lg text-sm"
            }, null, 512), [
              [
                vModelText,
                newSeries.value.knownTotal,
                void 0,
                { number: true }
              ]
            ])
          ]),
          createBaseVNode("div", _hoisted_7, [
            createBaseVNode("button", {
              type: "button",
              class: "addbtn px-4 py-2 rounded-lg text-sm font-medium",
              onClick: handleAddSeries
            }, " Save "),
            createBaseVNode("button", {
              type: "button",
              class: "px-4 py-2 text-sm text-muted hover:text-bone",
              onClick: _cache[5] || (_cache[5] = ($event) => showAddForm.value = false)
            }, " Cancel ")
          ])
        ])) : createCommentVNode("", true),
        unref(seriesList).length ? (openBlock(), createElementBlock("div", _hoisted_8, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(seriesList), (s) => {
            return openBlock(), createBlock(_component_SeriesRow, {
              key: s.id,
              series: s,
              progress: progresses.value[s.id] ?? { read: 0, total: 0 }
            }, null, 8, ["series", "progress"]);
          }), 128))
        ])) : (openBlock(), createElementBlock("div", _hoisted_9, [..._cache[9] || (_cache[9] = [
          createBaseVNode("p", null, "No series tracked yet.", -1)
        ])]))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
