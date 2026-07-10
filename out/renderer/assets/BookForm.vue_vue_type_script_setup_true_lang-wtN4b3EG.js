import { d as defineComponent, u as useLibraryStore, e as createElementBlock, f as createBaseVNode, F as Fragment, r as renderList, G as renderSlot, w as withModifiers, p as computed, b as openBlock, t as toDisplayString } from "./index-vRGsP6Kw.js";
const _hoisted_1 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" };
const _hoisted_2 = ["value"];
const _hoisted_3 = ["value"];
const _hoisted_4 = ["value"];
const _hoisted_5 = ["value"];
const _hoisted_6 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" };
const _hoisted_7 = ["value"];
const _hoisted_8 = ["value"];
const _hoisted_9 = ["value"];
const _hoisted_10 = ["value"];
const _hoisted_11 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" };
const _hoisted_12 = ["value"];
const _hoisted_13 = ["value"];
const _hoisted_14 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" };
const _hoisted_15 = ["value"];
const _hoisted_16 = ["value"];
const _hoisted_17 = ["value"];
const _hoisted_18 = ["value"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookForm",
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue", "submit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const store = useLibraryStore();
    const seriesList = computed(() => [...store.series].sort((a, b) => a.name.localeCompare(b.name)));
    function update(key, value) {
      emit("update:modelValue", { ...props.modelValue, [key]: value });
    }
    const statuses = [
      { value: "want_to_read", label: "Want to read" },
      { value: "reading", label: "Reading" },
      { value: "read", label: "Read" },
      { value: "abandoned", label: "Abandoned" }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("form", {
        class: "space-y-4",
        onSubmit: _cache[12] || (_cache[12] = withModifiers(($event) => emit("submit"), ["prevent"]))
      }, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", null, [
            _cache[13] || (_cache[13] = createBaseVNode("label", { class: "lbl block mb-1" }, "Title *", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.title,
              type: "text",
              required: "",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[0] || (_cache[0] = ($event) => update("title", $event.target.value))
            }, null, 40, _hoisted_2)
          ]),
          createBaseVNode("div", null, [
            _cache[14] || (_cache[14] = createBaseVNode("label", { class: "lbl block mb-1" }, "Author *", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.author,
              type: "text",
              required: "",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[1] || (_cache[1] = ($event) => update("author", $event.target.value))
            }, null, 40, _hoisted_3)
          ])
        ]),
        createBaseVNode("div", null, [
          _cache[15] || (_cache[15] = createBaseVNode("label", { class: "lbl block mb-1" }, "Status", -1)),
          createBaseVNode("select", {
            value: __props.modelValue.status ?? "want_to_read",
            class: "w-full field px-3 py-2 rounded-lg text-sm",
            onChange: _cache[2] || (_cache[2] = ($event) => update("status", $event.target.value))
          }, [
            (openBlock(), createElementBlock(Fragment, null, renderList(statuses, (s) => {
              return createBaseVNode("option", {
                key: s.value,
                value: s.value
              }, toDisplayString(s.label), 9, _hoisted_5);
            }), 64))
          ], 40, _hoisted_4)
        ]),
        createBaseVNode("div", _hoisted_6, [
          createBaseVNode("div", null, [
            _cache[17] || (_cache[17] = createBaseVNode("label", { class: "lbl block mb-1" }, "Series", -1)),
            createBaseVNode("select", {
              value: __props.modelValue.seriesId ?? "",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onChange: _cache[3] || (_cache[3] = ($event) => update("seriesId", $event.target.value || void 0))
            }, [
              _cache[16] || (_cache[16] = createBaseVNode("option", { value: "" }, "None", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(seriesList.value, (s) => {
                return openBlock(), createElementBlock("option", {
                  key: s.id,
                  value: s.id
                }, toDisplayString(s.name), 9, _hoisted_8);
              }), 128))
            ], 40, _hoisted_7)
          ]),
          createBaseVNode("div", null, [
            _cache[18] || (_cache[18] = createBaseVNode("label", { class: "lbl block mb-1" }, "Position in series", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.seriesPosition,
              type: "number",
              min: "1",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[4] || (_cache[4] = ($event) => update("seriesPosition", Number($event.target.value) || void 0))
            }, null, 40, _hoisted_9)
          ])
        ]),
        createBaseVNode("div", null, [
          _cache[19] || (_cache[19] = createBaseVNode("label", { class: "lbl block mb-1" }, "Cover URL", -1)),
          createBaseVNode("input", {
            value: __props.modelValue.coverUrl,
            type: "url",
            class: "w-full field px-3 py-2 rounded-lg text-sm",
            onInput: _cache[5] || (_cache[5] = ($event) => update("coverUrl", $event.target.value))
          }, null, 40, _hoisted_10)
        ]),
        createBaseVNode("div", _hoisted_11, [
          createBaseVNode("div", null, [
            _cache[20] || (_cache[20] = createBaseVNode("label", { class: "lbl block mb-1" }, "Genre", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.genre,
              type: "text",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[6] || (_cache[6] = ($event) => update("genre", $event.target.value))
            }, null, 40, _hoisted_12)
          ]),
          createBaseVNode("div", null, [
            _cache[21] || (_cache[21] = createBaseVNode("label", { class: "lbl block mb-1" }, "Published date", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.publishedDate,
              type: "text",
              placeholder: "2023 or 2023-06-01",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[7] || (_cache[7] = ($event) => update("publishedDate", $event.target.value))
            }, null, 40, _hoisted_13)
          ])
        ]),
        createBaseVNode("div", _hoisted_14, [
          createBaseVNode("div", null, [
            _cache[22] || (_cache[22] = createBaseVNode("label", { class: "lbl block mb-1" }, "Publisher", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.publisher,
              type: "text",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[8] || (_cache[8] = ($event) => update("publisher", $event.target.value))
            }, null, 40, _hoisted_15)
          ]),
          createBaseVNode("div", null, [
            _cache[23] || (_cache[23] = createBaseVNode("label", { class: "lbl block mb-1" }, "Page count", -1)),
            createBaseVNode("input", {
              value: __props.modelValue.pageCount,
              type: "number",
              min: "1",
              class: "w-full field px-3 py-2 rounded-lg text-sm",
              onInput: _cache[9] || (_cache[9] = ($event) => update("pageCount", Number($event.target.value) || void 0))
            }, null, 40, _hoisted_16)
          ])
        ]),
        createBaseVNode("div", null, [
          _cache[24] || (_cache[24] = createBaseVNode("label", { class: "lbl block mb-1" }, "Amazon URL", -1)),
          createBaseVNode("input", {
            value: __props.modelValue.amazonUrl,
            type: "url",
            class: "w-full field px-3 py-2 rounded-lg text-sm",
            onInput: _cache[10] || (_cache[10] = ($event) => update("amazonUrl", $event.target.value))
          }, null, 40, _hoisted_17)
        ]),
        createBaseVNode("div", null, [
          _cache[25] || (_cache[25] = createBaseVNode("label", { class: "lbl block mb-1" }, "Description", -1)),
          createBaseVNode("textarea", {
            value: __props.modelValue.description,
            rows: "3",
            class: "w-full field px-3 py-2 rounded-lg text-sm resize-none",
            onInput: _cache[11] || (_cache[11] = ($event) => update("description", $event.target.value))
          }, null, 40, _hoisted_18)
        ]),
        renderSlot(_ctx.$slots, "actions", {}, () => [
          _cache[26] || (_cache[26] = createBaseVNode("button", {
            type: "submit",
            class: "addbtn w-full py-2.5 px-4 rounded-lg font-medium text-sm"
          }, " Save to library ", -1))
        ])
      ], 32);
    };
  }
});
export {
  _sfc_main as _
};
