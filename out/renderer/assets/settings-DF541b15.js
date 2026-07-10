import { d as defineComponent, b as openBlock, e as createElementBlock, f as createBaseVNode, i as unref, m as createTextVNode, t as toDisplayString, q as ref, u as useLibraryStore, o as onMounted, x as createVNode, h as normalizeClass, j as createCommentVNode, F as Fragment, r as renderList, k as withDirectives, v as vModelText, l as withKeys, g as normalizeStyle } from "./index-vRGsP6Kw.js";
import { u as useHead } from "./nuxtCompat-CWRvesZB.js";
import { u as useTags } from "./useTags-8RTuaUDI.js";
function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function formatRating(rating) {
  if (!rating) return "—";
  const full = Math.floor(rating / 2);
  const half = rating % 2 !== 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
}
function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function useExport() {
  async function exportJson() {
    const data = await window.bookshelf.exportJson();
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    triggerDownload(JSON.stringify(data, null, 2), `bookshelf-export-${date}.json`, "application/json");
  }
  async function exportHtml() {
    const data = await window.bookshelf.exportJson();
    const books = data.books.filter((b) => b.status === "read");
    const reviewMap = new Map(data.reviews.map((r) => [r.bookId, r]));
    const cards = books.map((book) => {
      const review = reviewMap.get(book.id);
      const ratingStr = formatRating(review?.rating);
      const dateReadStr = formatDate(review?.dateRead);
      const coverHtml = book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}" class="cover">` : `<div class="cover-placeholder"></div>`;
      let reviewHtml = "";
      if (review?.reviewText) {
        if (review.containsSpoilers) {
          reviewHtml = `<details><summary>⚠ Spoiler review — click to reveal</summary><p class="review-text">${review.reviewText}</p></details>`;
        } else {
          reviewHtml = `<p class="review-text">${review.reviewText}</p>`;
        }
      }
      return `
      <article class="book-card">
        ${coverHtml}
        <div class="book-info">
          <h2 class="book-title">${book.title}</h2>
          <p class="book-author">${book.author}</p>
          <p class="book-rating">${ratingStr}</p>
          ${dateReadStr ? `<p class="book-date">Read: ${dateReadStr}</p>` : ""}
          ${reviewHtml}
        </div>
      </article>`;
    }).join("\n");
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Bookshelf</title>
<style>
  :root { --bg: #fff; --text: #111; --muted: #555; --border: #e5e7eb; --card-bg: #f9fafb; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0f172a; --text: #f1f5f9; --muted: #94a3b8; --border: #1e293b; --card-bg: #1e293b; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
  header { text-align: center; margin-bottom: 2rem; }
  header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
  header p { color: var(--muted); }
  .book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
  .book-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; gap: 1rem; }
  .cover { width: 80px; height: 120px; object-fit: cover; border-radius: 0.375rem; flex-shrink: 0; }
  .cover-placeholder { width: 80px; height: 120px; background: var(--border); border-radius: 0.375rem; flex-shrink: 0; }
  .book-info { flex: 1; min-width: 0; }
  .book-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
  .book-author { color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
  .book-rating { font-size: 1rem; color: #f59e0b; margin-bottom: 0.25rem; }
  .book-date { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.5rem; }
  .review-text { font-size: 0.875rem; line-height: 1.5; margin-top: 0.5rem; }
  details summary { cursor: pointer; font-size: 0.875rem; color: var(--muted); margin-top: 0.5rem; }
  footer { text-align: center; margin-top: 3rem; color: var(--muted); font-size: 0.875rem; }
</style>
</head>
<body>
<header>
  <h1>My Bookshelf</h1>
  <p>Exported on ${date}</p>
</header>
<main class="book-grid">
${cards}
</main>
<footer>Exported from Bookshelf</footer>
</body>
</html>`;
    const exportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    triggerDownload(html, `my-bookshelf-${exportDate}.html`, "text/html");
  }
  return { exportJson, exportHtml };
}
const _hoisted_1$1 = { class: "flex flex-wrap gap-3" };
const _hoisted_2$1 = ["disabled"];
const _hoisted_3$1 = ["disabled"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ExportButton",
  setup(__props) {
    const { exportJson, exportHtml } = useExport();
    const loadingJson = ref(false);
    const loadingHtml = ref(false);
    async function handleJson() {
      loadingJson.value = true;
      try {
        await exportJson();
      } finally {
        loadingJson.value = false;
      }
    }
    async function handleHtml() {
      loadingHtml.value = true;
      try {
        await exportHtml();
      } finally {
        loadingHtml.value = false;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("button", {
          type: "button",
          disabled: unref(loadingJson),
          class: "addbtn inline-flex items-center gap-2 px-4 py-2 disabled:opacity-60 rounded-lg text-sm font-medium",
          onClick: handleJson
        }, [
          _cache[0] || (_cache[0] = createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            class: "w-4 h-4",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor"
          }, [
            createBaseVNode("path", {
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "stroke-width": "2",
              d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            })
          ], -1)),
          createTextVNode(" " + toDisplayString(unref(loadingJson) ? "Exporting…" : "Export JSON"), 1)
        ], 8, _hoisted_2$1),
        createBaseVNode("button", {
          type: "button",
          disabled: unref(loadingHtml),
          class: "inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-muted hover:bg-ink-800 disabled:opacity-60 rounded-lg text-sm font-medium transition-colors",
          onClick: handleHtml
        }, [
          _cache[1] || (_cache[1] = createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            class: "w-4 h-4",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor"
          }, [
            createBaseVNode("path", {
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "stroke-width": "2",
              d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            })
          ], -1)),
          createTextVNode(" " + toDisplayString(unref(loadingHtml) ? "Generating…" : "Export reading card (HTML)"), 1)
        ], 8, _hoisted_3$1)
      ]);
    };
  }
});
function useImport() {
  async function importJson(file) {
    try {
      const text = await file.text();
      JSON.parse(text);
      await window.bookshelf.importJson(text);
      await useLibraryStore().refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  return { importJson };
}
const _hoisted_1 = { class: "max-w-2xl mx-auto space-y-8" };
const _hoisted_2 = { class: "bg-ink-850 rounded-xl border hair p-5 space-y-3" };
const _hoisted_3 = { class: "flex items-center gap-3" };
const _hoisted_4 = {
  key: 0,
  class: "text-sm text-[#9bc093]"
};
const _hoisted_5 = {
  key: 1,
  class: "text-sm text-faint"
};
const _hoisted_6 = { class: "bg-ink-850 rounded-xl border hair p-5 space-y-3" };
const _hoisted_7 = { class: "bg-ink-850 rounded-xl border hair p-5 space-y-3" };
const _hoisted_8 = { class: "inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-white/10 rounded-lg text-sm text-muted hover:bg-ink-800 transition-colors" };
const _hoisted_9 = { class: "bg-ink-850 rounded-xl border hair p-5 space-y-4" };
const _hoisted_10 = { class: "space-y-2" };
const _hoisted_11 = { class: "flex-1 text-sm text-bone" };
const _hoisted_12 = ["onClick"];
const _hoisted_13 = ["onClick"];
const _hoisted_14 = { class: "flex items-center gap-2 pt-2 border-t hair" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  setup(__props) {
    useHead({ title: "Settings — Bookshelf" });
    const amazonLoggedIn = ref(false);
    onMounted(async () => {
      amazonLoggedIn.value = await window.bookshelf.amazonIsLoggedIn();
    });
    async function handleAmazonLogin() {
      await window.bookshelf.amazonLogin();
      amazonLoggedIn.value = await window.bookshelf.amazonIsLoggedIn();
    }
    const { importJson } = useImport();
    const { tags, createTag, updateTag, deleteTag } = useTags();
    const importStatus = ref(null);
    const fileInput = ref();
    async function handleImport(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await importJson(file);
      importStatus.value = result.success ? { type: "success", message: "Import successful!" } : { type: "error", message: result.error ?? "Import failed." };
      if (fileInput.value) fileInput.value.value = "";
    }
    const newTagLabel = ref("");
    const newTagColor = ref("#c4a468");
    const editingTagId = ref(null);
    const editTagLabel = ref("");
    const editTagColor = ref("");
    async function handleCreateTag() {
      if (!newTagLabel.value.trim()) return;
      await createTag(newTagLabel.value.trim(), newTagColor.value);
      newTagLabel.value = "";
      newTagColor.value = "#c4a468";
    }
    function startEditTag(tag) {
      editingTagId.value = tag.id;
      editTagLabel.value = tag.label;
      editTagColor.value = tag.color;
    }
    async function saveEditTag() {
      if (!editingTagId.value) return;
      await updateTag(editingTagId.value, { label: editTagLabel.value, color: editTagColor.value });
      editingTagId.value = null;
    }
    return (_ctx, _cache) => {
      const _component_ExportButton = _sfc_main$1;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[14] || (_cache[14] = createBaseVNode("h1", { class: "font-serif text-[28px] font-medium text-bone" }, "Settings", -1)),
        createBaseVNode("section", _hoisted_2, [
          _cache[5] || (_cache[5] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Amazon", -1)),
          _cache[6] || (_cache[6] = createBaseVNode("p", { class: "text-sm text-muted" }, " Log in so the scraper can read your borrow history and ownership status when importing series. ", -1)),
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("button", {
              type: "button",
              class: "addbtn px-4 py-2 rounded-lg text-sm font-medium",
              onClick: handleAmazonLogin
            }, toDisplayString(amazonLoggedIn.value ? "Re-login to Amazon" : "Login to Amazon"), 1),
            amazonLoggedIn.value ? (openBlock(), createElementBlock("span", _hoisted_4, "Logged in")) : (openBlock(), createElementBlock("span", _hoisted_5, "Not logged in"))
          ])
        ]),
        createBaseVNode("section", _hoisted_6, [
          _cache[7] || (_cache[7] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Export", -1)),
          _cache[8] || (_cache[8] = createBaseVNode("p", { class: "text-sm text-muted" }, "Back up your library or generate a shareable reading card.", -1)),
          createVNode(_component_ExportButton)
        ]),
        createBaseVNode("section", _hoisted_7, [
          _cache[11] || (_cache[11] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Import", -1)),
          _cache[12] || (_cache[12] = createBaseVNode("p", { class: "text-sm text-muted" }, "Restore a backup. Existing records will be overwritten if IDs match.", -1)),
          createBaseVNode("div", null, [
            createBaseVNode("label", _hoisted_8, [
              _cache[9] || (_cache[9] = createBaseVNode("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                class: "w-4 h-4",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor"
              }, [
                createBaseVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                })
              ], -1)),
              _cache[10] || (_cache[10] = createTextVNode(" Choose JSON file ", -1)),
              createBaseVNode("input", {
                ref_key: "fileInput",
                ref: fileInput,
                type: "file",
                accept: ".json",
                class: "hidden",
                onChange: handleImport
              }, null, 544)
            ])
          ]),
          importStatus.value ? (openBlock(), createElementBlock("p", {
            key: 0,
            class: normalizeClass([importStatus.value.type === "success" ? "text-[#9bc093]" : "text-red-400", "text-sm"])
          }, toDisplayString(importStatus.value.message), 3)) : createCommentVNode("", true)
        ]),
        createBaseVNode("section", _hoisted_9, [
          _cache[13] || (_cache[13] = createBaseVNode("h2", { class: "font-semibold text-bone" }, "Tags", -1)),
          createBaseVNode("div", _hoisted_10, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(tags), (tag) => {
              return openBlock(), createElementBlock("div", {
                key: tag.id,
                class: "flex items-center gap-3"
              }, [
                editingTagId.value === tag.id ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => editTagLabel.value = $event),
                    type: "text",
                    class: "field flex-1 px-2 py-1 rounded text-sm"
                  }, null, 512), [
                    [vModelText, editTagLabel.value]
                  ]),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => editTagColor.value = $event),
                    type: "color",
                    class: "w-8 h-8 rounded cursor-pointer border-0"
                  }, null, 512), [
                    [vModelText, editTagColor.value]
                  ]),
                  createBaseVNode("button", {
                    type: "button",
                    class: "text-sm text-brass hover:text-brass-soft",
                    onClick: saveEditTag
                  }, "Save"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "text-sm text-faint hover:text-muted",
                    onClick: _cache[2] || (_cache[2] = ($event) => editingTagId.value = null)
                  }, "Cancel")
                ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createBaseVNode("span", {
                    class: "w-4 h-4 rounded-full flex-shrink-0",
                    style: normalizeStyle({ backgroundColor: tag.color })
                  }, null, 4),
                  createBaseVNode("span", _hoisted_11, toDisplayString(tag.label), 1),
                  createBaseVNode("button", {
                    type: "button",
                    class: "text-xs text-faint hover:text-muted",
                    onClick: ($event) => startEditTag(tag)
                  }, "Edit", 8, _hoisted_12),
                  createBaseVNode("button", {
                    type: "button",
                    class: "text-xs text-red-400 hover:text-red-300",
                    onClick: ($event) => unref(deleteTag)(tag.id)
                  }, "Delete", 8, _hoisted_13)
                ], 64))
              ]);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_14, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => newTagLabel.value = $event),
              type: "text",
              placeholder: "New tag name",
              class: "field flex-1 px-3 py-2 rounded-lg text-sm",
              onKeydown: withKeys(handleCreateTag, ["enter"])
            }, null, 544), [
              [vModelText, newTagLabel.value]
            ]),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => newTagColor.value = $event),
              type: "color",
              class: "w-9 h-9 rounded cursor-pointer border border-white/10"
            }, null, 512), [
              [vModelText, newTagColor.value]
            ]),
            createBaseVNode("button", {
              type: "button",
              class: "addbtn px-3 py-2 rounded-lg text-sm font-medium",
              onClick: handleCreateTag
            }, " Add ")
          ])
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
