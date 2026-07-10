import { _ as _sfc_main$2 } from "./BookForm.vue_vue_type_script_setup_true_lang-wtN4b3EG.js";
import { _ as _sfc_main$1 } from "./CoverImage.vue_vue_type_script_setup_true_lang-CHLHa5nF.js";
import { d as defineComponent, e as createElementBlock, f as createBaseVNode, x as createVNode, y as withCtx, h as normalizeClass, k as withDirectives, v as vModelText, l as withKeys, t as toDisplayString, j as createCommentVNode, q as ref, z as resolveComponent, b as openBlock, B as useRouter } from "./index-vRGsP6Kw.js";
import { a as addBook } from "./useBooks-DEAcE43j.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
const _hoisted_1 = { class: "max-w-2xl mx-auto space-y-6" };
const _hoisted_2 = { class: "flex items-center gap-3" };
const _hoisted_3 = { class: "flex gap-1 bg-ink-800 p-1 rounded-lg w-fit" };
const _hoisted_4 = {
  key: 0,
  class: "space-y-5"
};
const _hoisted_5 = { class: "flex gap-2" };
const _hoisted_6 = ["disabled"];
const _hoisted_7 = {
  key: 0,
  class: "text-sm text-red-400"
};
const _hoisted_8 = {
  key: 1,
  class: "space-y-4"
};
const _hoisted_9 = {
  key: 0,
  class: "flex gap-4"
};
const _hoisted_10 = { class: "text-sm text-muted space-y-1" };
const _hoisted_11 = {
  key: 0,
  class: "font-semibold text-bone text-base"
};
const _hoisted_12 = { key: 1 };
const _hoisted_13 = { key: 2 };
const _hoisted_14 = { key: 1 };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "add",
  setup(__props) {
    useHead({ title: "Add Book — Bookshelf" });
    const router = useRouter();
    const activeTab = ref("amazon");
    const amazonUrl = ref("");
    const lookupLoading = ref(false);
    const lookupError = ref("");
    const phase = ref({ kind: "idle" });
    const bookData = ref({ status: "want_to_read" });
    async function handleLookup() {
      const url = amazonUrl.value.trim();
      if (!url) return;
      lookupLoading.value = true;
      lookupError.value = "";
      phase.value = { kind: "idle" };
      try {
        const result = await window.bookshelf.scrapeBook(url);
        if (result.error) {
          lookupError.value = result.error;
          return;
        }
        bookData.value = {
          title: result.title,
          author: result.author,
          coverUrl: result.coverUrl,
          asin: result.asin,
          amazonUrl: url,
          description: result.description,
          publishedDate: result.publishedDate,
          status: "want_to_read"
        };
        phase.value = { kind: "found" };
      } finally {
        lookupLoading.value = false;
      }
    }
    async function handleSave() {
      if (!bookData.value.title || !bookData.value.author) return;
      await addBook(bookData.value);
      router.push("/");
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_CoverImage = _sfc_main$1;
      const _component_BookForm = _sfc_main$2;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_RouterLink, {
            to: "/",
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
          _cache[6] || (_cache[6] = createBaseVNode("h1", { class: "font-serif text-[28px] font-medium text-bone" }, "Add a book", -1))
        ]),
        createBaseVNode("div", _hoisted_3, [
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass([activeTab.value === "amazon" ? "bg-ink-850 shadow-sm text-bone" : "text-muted", "px-4 py-1.5 rounded-md text-sm font-medium transition-all"]),
            onClick: _cache[0] || (_cache[0] = ($event) => activeTab.value = "amazon")
          }, " Amazon link ", 2),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass([activeTab.value === "manual" ? "bg-ink-850 shadow-sm text-bone" : "text-muted", "px-4 py-1.5 rounded-md text-sm font-medium transition-all"]),
            onClick: _cache[1] || (_cache[1] = ($event) => activeTab.value = "manual")
          }, " Manual entry ", 2)
        ]),
        activeTab.value === "amazon" ? (openBlock(), createElementBlock("div", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => amazonUrl.value = $event),
              type: "url",
              placeholder: "Paste Amazon.de URL…",
              class: "field flex-1 px-3 py-2 rounded-lg text-sm",
              onKeydown: withKeys(handleLookup, ["enter"])
            }, null, 544), [
              [vModelText, amazonUrl.value]
            ]),
            createBaseVNode("button", {
              type: "button",
              disabled: lookupLoading.value || !amazonUrl.value,
              class: "addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium",
              onClick: handleLookup
            }, toDisplayString(lookupLoading.value ? "Fetching…" : "Look up"), 9, _hoisted_6)
          ]),
          lookupError.value ? (openBlock(), createElementBlock("p", _hoisted_7, toDisplayString(lookupError.value), 1)) : createCommentVNode("", true),
          phase.value.kind === "found" ? (openBlock(), createElementBlock("div", _hoisted_8, [
            bookData.value.coverUrl || bookData.value.title ? (openBlock(), createElementBlock("div", _hoisted_9, [
              createVNode(_component_CoverImage, {
                src: bookData.value.coverUrl,
                alt: bookData.value.title,
                class: "w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden"
              }, null, 8, ["src", "alt"]),
              createBaseVNode("div", _hoisted_10, [
                bookData.value.title ? (openBlock(), createElementBlock("p", _hoisted_11, toDisplayString(bookData.value.title), 1)) : createCommentVNode("", true),
                bookData.value.author ? (openBlock(), createElementBlock("p", _hoisted_12, "by " + toDisplayString(bookData.value.author), 1)) : createCommentVNode("", true),
                bookData.value.publishedDate ? (openBlock(), createElementBlock("p", _hoisted_13, toDisplayString(bookData.value.publishedDate), 1)) : createCommentVNode("", true)
              ])
            ])) : createCommentVNode("", true),
            createVNode(_component_BookForm, {
              modelValue: bookData.value,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => bookData.value = $event),
              onSubmit: handleSave
            }, null, 8, ["modelValue"])
          ])) : createCommentVNode("", true)
        ])) : (openBlock(), createElementBlock("div", _hoisted_14, [
          createVNode(_component_BookForm, {
            modelValue: bookData.value,
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => bookData.value = $event),
            onSubmit: handleSave
          }, null, 8, ["modelValue"])
        ]))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
