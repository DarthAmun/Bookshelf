import { d as defineComponent, e as createElementBlock, j as createCommentVNode, f as createBaseVNode, h as normalizeClass, b as openBlock } from "./index-vRGsP6Kw.js";
const _hoisted_1 = ["src", "alt"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CoverImage",
  props: {
    src: {},
    alt: {},
    class: {}
  },
  setup(__props) {
    const fallback = (e) => {
      const img = e.target;
      img.style.display = "none";
      img.nextElementSibling?.classList.remove("hidden");
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["relative", _ctx.$props.class])
      }, [
        __props.src ? (openBlock(), createElementBlock("img", {
          key: 0,
          src: __props.src,
          alt: __props.alt ?? "Book cover",
          class: "w-full h-full object-cover rounded",
          onError: fallback
        }, null, 40, _hoisted_1)) : createCommentVNode("", true),
        createBaseVNode("div", {
          class: normalizeClass([__props.src ? "hidden" : "", "w-full h-full bg-ink-750 rounded flex items-center justify-center"])
        }, [..._cache[0] || (_cache[0] = [
          createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            class: "w-8 h-8 text-faint",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor"
          }, [
            createBaseVNode("path", {
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "stroke-width": "1.5",
              d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            })
          ], -1)
        ])], 2)
      ], 2);
    };
  }
});
export {
  _sfc_main as _
};
