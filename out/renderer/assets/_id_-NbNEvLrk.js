import { d as defineComponent, b as openBlock, e as createElementBlock, m as createTextVNode, t as toDisplayString, w as withModifiers, j as createCommentVNode, g as normalizeStyle, F as Fragment, r as renderList, f as createBaseVNode, h as normalizeClass, i as unref, q as ref, p as computed, u as useLibraryStore, o as onMounted, C as watch, x as createVNode, y as withCtx, c as createBlock, k as withDirectives, v as vModelText, D as vModelCheckbox, E as useRoute, z as resolveComponent, B as useRouter } from "./index-vRGsP6Kw.js";
import { _ as _sfc_main$5 } from "./BookForm.vue_vue_type_script_setup_true_lang-wtN4b3EG.js";
import { _ as _sfc_main$4 } from "./StatusBadge.vue_vue_type_script_setup_true_lang-vBhcZSrA.js";
import { _ as _sfc_main$3 } from "./CoverImage.vue_vue_type_script_setup_true_lang-CHLHa5nF.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
import { u as useBooks } from "./useBooks-DEAcE43j.js";
import { u as useTags } from "./useTags-8RTuaUDI.js";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TagChip",
  props: {
    tag: {},
    removable: { type: Boolean }
  },
  emits: ["remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white",
        style: normalizeStyle({ backgroundColor: props.tag.color })
      }, [
        createTextVNode(toDisplayString(__props.tag.label) + " ", 1),
        __props.removable ? (openBlock(), createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ml-0.5 hover:opacity-75 focus:outline-none",
          onClick: _cache[0] || (_cache[0] = withModifiers(($event) => emit("remove"), ["stop"]))
        }, " × ")) : createCommentVNode("", true)
      ], 4);
    };
  }
});
const _hoisted_1$1 = { class: "flex items-center gap-1" };
const _hoisted_2$1 = ["onMouseenter", "onClick"];
const _hoisted_3$1 = { class: "ml-2 text-sm text-faint" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RatingInput",
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hovered = ref(null);
    const displayed = computed(() => hovered.value ?? props.modelValue ?? 0);
    function setRating(val) {
      emit("update:modelValue", val);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        (openBlock(), createElementBlock(Fragment, null, renderList(10, (n) => {
          return createBaseVNode("button", {
            key: n,
            type: "button",
            class: normalizeClass(["text-lg leading-none focus:outline-none transition-colors", n <= unref(displayed) ? "text-brass-soft" : "text-faint"]),
            onMouseenter: ($event) => hovered.value = n,
            onMouseleave: _cache[0] || (_cache[0] = ($event) => hovered.value = null),
            onClick: ($event) => setRating(n)
          }, toDisplayString(n % 2 !== 0 ? "⬠" : "★"), 43, _hoisted_2$1);
        }), 64)),
        createBaseVNode("span", _hoisted_3$1, toDisplayString(__props.modelValue ? `${__props.modelValue}/10` : "No rating"), 1)
      ]);
    };
  }
});
function useReviews() {
  async function addReview(data) {
    const existing = await window.bookshelf.getReview(data.bookId);
    if (existing) {
      const updated = { ...existing, ...data, updatedAt: Date.now() };
      await window.bookshelf.saveReview(updated);
      return existing.id;
    }
    const review = { ...data, id: crypto.randomUUID(), updatedAt: Date.now() };
    await window.bookshelf.saveReview(review);
    return review.id;
  }
  async function updateReview(id, changes) {
    const review = await window.bookshelf.getReview(changes.bookId ?? id);
    if (!review) return;
    await window.bookshelf.saveReview({ ...review, ...changes, updatedAt: Date.now() });
  }
  async function getReviewForBook(bookId) {
    return window.bookshelf.getReview(bookId);
  }
  return { addReview, updateReview, getReviewForBook };
}
const _hoisted_1 = {
  key: 0,
  class: "max-w-2xl mx-auto space-y-6"
};
const _hoisted_2 = { class: "flex items-center gap-3" };
const _hoisted_3 = { class: "text-sm text-muted" };
const _hoisted_4 = { key: 1 };
const _hoisted_5 = { class: "flex gap-6" };
const _hoisted_6 = { class: "flex-1 min-w-0 space-y-3" };
const _hoisted_7 = { class: "flex items-start justify-between gap-2" };
const _hoisted_8 = { class: "font-serif text-2xl font-medium text-bone" };
const _hoisted_9 = { class: "text-muted mt-0.5" };
const _hoisted_10 = { class: "flex flex-wrap gap-2 items-center" };
const _hoisted_11 = ["value"];
const _hoisted_12 = { class: "text-sm text-muted space-y-0.5" };
const _hoisted_13 = { key: 0 };
const _hoisted_14 = { key: 1 };
const _hoisted_15 = { key: 2 };
const _hoisted_16 = ["href"];
const _hoisted_17 = {
  key: 0,
  class: "text-sm text-muted leading-relaxed line-clamp-4"
};
const _hoisted_18 = {
  key: 1,
  class: "bg-ink-850 rounded-xl border hair p-5 space-y-4"
};
const _hoisted_19 = { class: "flex items-center justify-between" };
const _hoisted_20 = { class: "border-t hair pt-6 space-y-4" };
const _hoisted_21 = ["value"];
const _hoisted_22 = { class: "flex items-center gap-2 mt-2 text-sm text-muted cursor-pointer" };
const _hoisted_23 = ["disabled"];
const _hoisted_24 = { class: "border-t hair pt-6 space-y-3" };
const _hoisted_25 = { class: "flex flex-wrap gap-2" };
const _hoisted_26 = ["value"];
const _hoisted_27 = { class: "border-t hair pt-6" };
const _hoisted_28 = {
  key: 1,
  class: "flex items-center gap-3"
};
const _hoisted_29 = { class: "text-sm text-muted" };
const _hoisted_30 = {
  key: 1,
  class: "text-center py-20 text-faint"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;
    useHead(() => ({ title: book.value ? `${book.value.title} — Bookshelf` : "Book — Bookshelf" }));
    const store = useLibraryStore();
    const book = ref(void 0);
    const review = ref(void 0);
    const bookTags = ref([]);
    const series = computed(() => {
      if (!book.value?.seriesId) return void 0;
      return store.series.find((s) => s.id === book.value.seriesId);
    });
    const allTags = computed(() => [...store.tags].sort((a, b) => a.label.localeCompare(b.label)));
    async function loadPageData() {
      const [b, r, tagIds] = await Promise.all([
        window.bookshelf.getBook(id),
        window.bookshelf.getReview(id),
        window.bookshelf.getBookTags(id)
      ]);
      book.value = b;
      review.value = r;
      bookTags.value = store.tags.filter((t) => tagIds.includes(t.id));
    }
    onMounted(loadPageData);
    const { updateBook, deleteBook } = useBooks();
    const { addReview } = useReviews();
    const { addTagToBook, removeTagFromBook } = useTags();
    const reviewForm = ref({});
    const showDeleteConfirm = ref(false);
    const saving = ref(false);
    const editing = ref(false);
    const editData = ref({});
    watch(() => review.value, (r) => {
      if (r) reviewForm.value = { ...r };
    }, { immediate: true });
    function startEdit() {
      if (!book.value) return;
      const { coverUrl, ...rest } = book.value;
      editData.value = { ...rest, coverUrl: coverUrl?.startsWith("data:") ? void 0 : coverUrl };
      editing.value = true;
    }
    async function saveEdit() {
      const changes = { ...editData.value };
      if (!changes.coverUrl && book.value?.coverUrl?.startsWith("data:")) {
        changes.coverUrl = book.value.coverUrl;
      }
      await updateBook(id, changes);
      editing.value = false;
      await loadPageData();
    }
    async function saveReview() {
      if (!book.value) return;
      saving.value = true;
      try {
        await addReview({
          bookId: id,
          rating: reviewForm.value.rating,
          reviewText: reviewForm.value.reviewText,
          containsSpoilers: reviewForm.value.containsSpoilers ?? false,
          dateRead: reviewForm.value.dateRead
        });
        review.value = await window.bookshelf.getReview(id);
      } finally {
        saving.value = false;
      }
    }
    async function handleDelete() {
      await deleteBook(id);
      router.push("/");
    }
    async function handleStatusChange(status) {
      await updateBook(id, { status });
      if (book.value) book.value = { ...book.value, status };
    }
    async function handleAddTag(tagId) {
      await addTagToBook(id, tagId);
      const tagIds = await window.bookshelf.getBookTags(id);
      bookTags.value = store.tags.filter((t) => tagIds.includes(t.id));
    }
    async function handleRemoveTag(tagId) {
      await removeTagFromBook(id, tagId);
      bookTags.value = bookTags.value.filter((t) => t.id !== tagId);
    }
    const availableTags = computed(() => {
      const existing = new Set(bookTags.value.map((t) => t.id));
      return allTags.value.filter((t) => !existing.has(t.id));
    });
    function formatDate(ts) {
      if (!ts) return "";
      return new Date(ts).toISOString().split("T")[0];
    }
    function parseDateInput(val) {
      if (!val) return void 0;
      return new Date(val).getTime();
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_CoverImage = _sfc_main$3;
      const _component_StatusBadge = _sfc_main$4;
      const _component_BookForm = _sfc_main$5;
      const _component_RatingInput = _sfc_main$1;
      const _component_TagChip = _sfc_main$2;
      return book.value ? (openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_RouterLink, {
            to: "/",
            class: "text-faint hover:text-muted"
          }, {
            default: withCtx(() => [..._cache[10] || (_cache[10] = [
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
          createBaseVNode("nav", _hoisted_3, [
            series.value ? (openBlock(), createBlock(_component_RouterLink, {
              key: 0,
              to: `/series/${series.value.id}`,
              class: "hover:underline"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(series.value.name), 1)
              ]),
              _: 1
            }, 8, ["to"])) : createCommentVNode("", true),
            series.value && book.value.seriesPosition ? (openBlock(), createElementBlock("span", _hoisted_4, " #" + toDisplayString(book.value.seriesPosition), 1)) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createVNode(_component_CoverImage, {
            src: book.value.coverUrl,
            alt: book.value.title,
            class: "w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden"
          }, null, 8, ["src", "alt"]),
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", null, [
                createBaseVNode("h1", _hoisted_8, toDisplayString(book.value.title), 1),
                createBaseVNode("p", _hoisted_9, toDisplayString(book.value.author), 1)
              ]),
              createBaseVNode("button", {
                type: "button",
                class: "flex-shrink-0 text-sm text-brass hover:text-brass-soft",
                onClick: startEdit
              }, " Edit ")
            ]),
            createBaseVNode("div", _hoisted_10, [
              createBaseVNode("select", {
                value: book.value.status,
                class: "field px-3 py-1.5 rounded-lg text-sm",
                onChange: _cache[0] || (_cache[0] = ($event) => handleStatusChange($event.target.value))
              }, [..._cache[11] || (_cache[11] = [
                createBaseVNode("option", { value: "want_to_read" }, "Want to read", -1),
                createBaseVNode("option", { value: "reading" }, "Reading", -1),
                createBaseVNode("option", { value: "read" }, "Read", -1),
                createBaseVNode("option", { value: "abandoned" }, "Abandoned", -1)
              ])], 40, _hoisted_11),
              createVNode(_component_StatusBadge, {
                status: book.value.status
              }, null, 8, ["status"])
            ]),
            createBaseVNode("div", _hoisted_12, [
              book.value.genre ? (openBlock(), createElementBlock("p", _hoisted_13, toDisplayString(book.value.genre), 1)) : createCommentVNode("", true),
              book.value.publishedDate ? (openBlock(), createElementBlock("p", _hoisted_14, toDisplayString(book.value.publishedDate.length === 4 ? `Expected ~${book.value.publishedDate}` : book.value.publishedDate), 1)) : createCommentVNode("", true),
              book.value.pageCount ? (openBlock(), createElementBlock("p", _hoisted_15, toDisplayString(book.value.pageCount) + " pages", 1)) : createCommentVNode("", true)
            ]),
            book.value.amazonUrl ? (openBlock(), createElementBlock("a", {
              key: 0,
              href: book.value.amazonUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "inline-flex items-center gap-1 text-sm text-brass hover:text-brass-soft"
            }, " View on Amazon ↗ ", 8, _hoisted_16)) : createCommentVNode("", true)
          ])
        ]),
        book.value.description && !editing.value ? (openBlock(), createElementBlock("div", _hoisted_17, toDisplayString(book.value.description), 1)) : createCommentVNode("", true),
        editing.value ? (openBlock(), createElementBlock("div", _hoisted_18, [
          createBaseVNode("div", _hoisted_19, [
            _cache[12] || (_cache[12] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Edit details", -1)),
            createBaseVNode("button", {
              type: "button",
              class: "text-sm text-faint hover:text-muted",
              onClick: _cache[1] || (_cache[1] = ($event) => editing.value = false)
            }, "Cancel")
          ]),
          createVNode(_component_BookForm, {
            modelValue: editData.value,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => editData.value = $event),
            onSubmit: saveEdit
          }, {
            actions: withCtx(() => [..._cache[13] || (_cache[13] = [
              createBaseVNode("button", {
                type: "submit",
                class: "addbtn px-4 py-2 rounded-lg text-sm font-medium"
              }, " Save changes ", -1)
            ])]),
            _: 1
          }, 8, ["modelValue"])
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_20, [
          _cache[18] || (_cache[18] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Review", -1)),
          createBaseVNode("div", null, [
            _cache[14] || (_cache[14] = createBaseVNode("label", { class: "lbl block mb-2" }, "Rating (1–10)", -1)),
            createVNode(_component_RatingInput, {
              modelValue: reviewForm.value.rating,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => reviewForm.value.rating = $event)
            }, null, 8, ["modelValue"])
          ]),
          createBaseVNode("div", null, [
            _cache[15] || (_cache[15] = createBaseVNode("label", { class: "lbl block mb-1" }, "Date read", -1)),
            createBaseVNode("input", {
              value: formatDate(reviewForm.value.dateRead),
              type: "date",
              class: "field px-3 py-2 rounded-lg text-sm",
              onChange: _cache[4] || (_cache[4] = ($event) => reviewForm.value.dateRead = parseDateInput($event.target.value))
            }, null, 40, _hoisted_21)
          ]),
          createBaseVNode("div", null, [
            _cache[17] || (_cache[17] = createBaseVNode("label", { class: "lbl block mb-1" }, "Review", -1)),
            withDirectives(createBaseVNode("textarea", {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => reviewForm.value.reviewText = $event),
              rows: "4",
              placeholder: "What did you think?",
              class: "field w-full px-3 py-2 rounded-lg text-sm resize-none"
            }, null, 512), [
              [vModelText, reviewForm.value.reviewText]
            ]),
            createBaseVNode("label", _hoisted_22, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => reviewForm.value.containsSpoilers = $event),
                type: "checkbox",
                class: "rounded"
              }, null, 512), [
                [vModelCheckbox, reviewForm.value.containsSpoilers]
              ]),
              _cache[16] || (_cache[16] = createTextVNode(" Contains spoilers ", -1))
            ])
          ]),
          createBaseVNode("button", {
            type: "button",
            disabled: saving.value,
            class: "addbtn px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium",
            onClick: saveReview
          }, toDisplayString(saving.value ? "Saving…" : "Save review"), 9, _hoisted_23)
        ]),
        createBaseVNode("div", _hoisted_24, [
          _cache[20] || (_cache[20] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Tags", -1)),
          createBaseVNode("div", _hoisted_25, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(bookTags.value, (tag) => {
              return openBlock(), createBlock(_component_TagChip, {
                key: tag.id,
                tag,
                removable: "",
                onRemove: ($event) => handleRemoveTag(tag.id)
              }, null, 8, ["tag", "onRemove"]);
            }), 128)),
            availableTags.value.length ? (openBlock(), createElementBlock("select", {
              key: 0,
              class: "field px-2 py-1 rounded-lg text-sm",
              onChange: _cache[7] || (_cache[7] = ($event) => {
                handleAddTag($event.target.value);
                $event.target.value = "";
              })
            }, [
              _cache[19] || (_cache[19] = createBaseVNode("option", { value: "" }, "+ Add tag", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(availableTags.value, (t) => {
                return openBlock(), createElementBlock("option", {
                  key: t.id,
                  value: t.id
                }, toDisplayString(t.label), 9, _hoisted_26);
              }), 128))
            ], 32)) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("div", _hoisted_27, [
          !showDeleteConfirm.value ? (openBlock(), createElementBlock("button", {
            key: 0,
            type: "button",
            class: "text-sm text-red-400 hover:text-red-300",
            onClick: _cache[8] || (_cache[8] = ($event) => showDeleteConfirm.value = true)
          }, " Delete book ")) : (openBlock(), createElementBlock("div", _hoisted_28, [
            createBaseVNode("p", _hoisted_29, 'Remove "' + toDisplayString(book.value.title) + '" from your library?', 1),
            createBaseVNode("button", {
              type: "button",
              class: "px-3 py-1.5 bg-red-700 hover:bg-red-600 text-bone rounded-lg text-sm font-medium",
              onClick: handleDelete
            }, " Delete "),
            createBaseVNode("button", {
              type: "button",
              class: "px-3 py-1.5 text-sm text-muted hover:text-bone",
              onClick: _cache[9] || (_cache[9] = ($event) => showDeleteConfirm.value = false)
            }, " Cancel ")
          ]))
        ])
      ])) : (openBlock(), createElementBlock("div", _hoisted_30, [
        _cache[22] || (_cache[22] = createBaseVNode("p", null, "Book not found.", -1)),
        createVNode(_component_RouterLink, {
          to: "/",
          class: "mt-2 text-brass hover:text-brass-soft text-sm"
        }, {
          default: withCtx(() => [..._cache[21] || (_cache[21] = [
            createTextVNode("← Back to library", -1)
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
