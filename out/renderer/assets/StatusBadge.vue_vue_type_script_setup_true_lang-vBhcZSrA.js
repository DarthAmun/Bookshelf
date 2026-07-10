import { d as defineComponent, e as createElementBlock, f as createBaseVNode, m as createTextVNode, t as toDisplayString, h as normalizeClass, b as openBlock } from "./index-vRGsP6Kw.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StatusBadge",
  props: {
    status: {}
  },
  setup(__props) {
    const labels = {
      want_to_read: "Want to read",
      reading: "Reading",
      read: "Read",
      abandoned: "Abandoned"
    };
    const badgeClass = {
      want_to_read: "s-want",
      reading: "s-reading",
      read: "s-read",
      abandoned: "s-abandoned"
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        class: normalizeClass(["badge", badgeClass[__props.status]])
      }, [
        _cache[0] || (_cache[0] = createBaseVNode("span", { class: "dot" }, null, -1)),
        createTextVNode(" " + toDisplayString(labels[__props.status]), 1)
      ], 2);
    };
  }
});
export {
  _sfc_main as _
};
