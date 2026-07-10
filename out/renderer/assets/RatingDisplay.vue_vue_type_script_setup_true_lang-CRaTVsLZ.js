import { d as defineComponent, b as openBlock, e as createElementBlock, f as createBaseVNode, g as normalizeStyle, i as unref, h as normalizeClass, t as toDisplayString, j as createCommentVNode, p as computed } from "./index-vRGsP6Kw.js";
const _hoisted_1 = {
  key: 0,
  class: "flex items-center gap-1.5"
};
const _hoisted_2 = { class: "font-mono text-[10px] text-faint" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "RatingDisplay",
  props: {
    rating: {},
    size: {}
  },
  setup(__props) {
    const props = __props;
    const starsPercent = computed(() => {
      if (!props.rating) return null;
      return (props.rating / 10 * 100).toFixed(1);
    });
    const displayRating = computed(() => {
      if (!props.rating) return null;
      return (props.rating / 2).toFixed(1).replace(/\.0$/, "");
    });
    return (_ctx, _cache) => {
      return __props.rating ? (openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("span", {
          class: normalizeClass(["stars", __props.size === "sm" ? "text-[11px]" : "text-[13px]"])
        }, [
          _cache[0] || (_cache[0] = createBaseVNode("span", { class: "stars-bg" }, "★★★★★", -1)),
          createBaseVNode("span", {
            class: "stars-fg",
            style: normalizeStyle({ width: `${unref(starsPercent)}%` })
          }, "★★★★★", 4)
        ], 2),
        createBaseVNode("span", _hoisted_2, toDisplayString(unref(displayRating)), 1)
      ])) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as _
};
