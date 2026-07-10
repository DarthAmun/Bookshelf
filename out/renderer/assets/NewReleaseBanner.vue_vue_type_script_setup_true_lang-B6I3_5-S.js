import { d as defineComponent, i as unref, e as createElementBlock, F as Fragment, r as renderList, j as createCommentVNode, p as computed, b as openBlock, f as createBaseVNode, t as toDisplayString, m as createTextVNode, s as reactive } from "./index-vRGsP6Kw.js";
const _hoisted_1 = {
  key: 0,
  class: "space-y-2.5"
};
const _hoisted_2 = { class: "min-w-0 flex-1" };
const _hoisted_3 = { class: "mt-0.5 truncate font-serif text-[16px] text-bone" };
const _hoisted_4 = {
  key: 0,
  class: "italic"
};
const _hoisted_5 = { key: 1 };
const _hoisted_6 = {
  key: 2,
  class: "text-muted"
};
const _hoisted_7 = { class: "hidden shrink-0 items-center gap-2 sm:flex" };
const _hoisted_8 = ["href"];
const _hoisted_9 = ["onClick"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NewReleaseBanner",
  props: {
    series: {}
  },
  setup(__props) {
    const props = __props;
    const dismissed = reactive(/* @__PURE__ */ new Set());
    const visible = computed(() => props.series.filter((s) => s.newReleaseAvailable && !dismissed.has(s.id)));
    function dismiss(id) {
      dismissed.add(id);
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      if (dateStr.length === 4) return `expected ~${dateStr}`;
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    }
    return (_ctx, _cache) => {
      return unref(visible).length ? (openBlock(), createElementBlock("div", _hoisted_1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visible), (s) => {
          return openBlock(), createElementBlock("div", {
            key: s.id,
            class: "group flex items-center gap-4 rounded-md border hair bg-ink-850/60 px-5 py-4 transition hover:border-brass/40 hover:bg-ink-800/70"
          }, [
            _cache[3] || (_cache[3] = createBaseVNode("span", { class: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/12 ring-1 ring-brass/30" }, [
              createBaseVNode("span", {
                class: "h-2 w-2 rounded-full bg-brass",
                style: { "box-shadow": "0 0 10px rgba(196,164,104,.8)" }
              })
            ], -1)),
            createBaseVNode("div", _hoisted_2, [
              _cache[0] || (_cache[0] = createBaseVNode("div", { class: "font-mono text-[10px] uppercase tracking-[.18em] text-brass/80" }, "New in the series · awaiting release", -1)),
              createBaseVNode("div", _hoisted_3, [
                s.nextBookTitle ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(s.nextBookTitle), 1)) : (openBlock(), createElementBlock("span", _hoisted_5, "New book")),
                createTextVNode(" — " + toDisplayString(s.name) + " ", 1),
                s.nextBookDate ? (openBlock(), createElementBlock("span", _hoisted_6, " · " + toDisplayString(formatDate(s.nextBookDate)), 1)) : createCommentVNode("", true)
              ])
            ]),
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("a", {
                href: `https://www.amazon.com/s?k=${encodeURIComponent(s.name + " " + s.author)}`,
                target: "_blank",
                rel: "noopener",
                class: "inline-flex items-center gap-1.5 rounded-md border border-brass/40 bg-brass/10 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-brass-soft transition hover:bg-brass/20"
              }, [..._cache[1] || (_cache[1] = [
                createTextVNode(" Check on Amazon ", -1),
                createBaseVNode("svg", {
                  width: "11",
                  height: "11",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2"
                }, [
                  createBaseVNode("path", { d: "M7 17 17 7M9 7h8v8" })
                ], -1)
              ])], 8, _hoisted_8),
              createBaseVNode("button", {
                type: "button",
                class: "flex h-8 w-8 items-center justify-center rounded-md text-faint hover:text-muted transition-colors",
                onClick: ($event) => dismiss(s.id)
              }, [..._cache[2] || (_cache[2] = [
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
              ])], 8, _hoisted_9)
            ])
          ]);
        }), 128))
      ])) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as _
};
