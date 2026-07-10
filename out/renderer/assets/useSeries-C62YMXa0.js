import { u as useLibraryStore, A as storeToRefs } from "./index-vRGsP6Kw.js";
async function addSeries(data) {
  const series = { ...data, id: crypto.randomUUID() };
  await window.bookshelf.saveSeries(series);
  await useLibraryStore().loadSeries();
  return series;
}
async function findSeriesByName(name) {
  const store = useLibraryStore();
  return store.series.find((s) => s.name.toLowerCase() === name.toLowerCase());
}
function useSeries() {
  const store = useLibraryStore();
  const { series: seriesList, books } = storeToRefs(store);
  async function updateSeries(id, changes) {
    await window.bookshelf.updateSeries(id, changes);
    await store.loadSeries();
  }
  async function deleteSeries(id) {
    await window.bookshelf.deleteSeries(id);
    await store.refresh();
  }
  async function getSeriesById(id) {
    return store.series.find((s) => s.id === id);
  }
  async function getSeriesProgress(seriesId) {
    const seriesBooks = store.books.filter((b) => b.seriesId === seriesId);
    const read = seriesBooks.filter((b) => b.status === "read").length;
    const s = store.series.find((s2) => s2.id === seriesId);
    const total = s?.knownTotal ?? seriesBooks.length;
    return { read, total, books: seriesBooks };
  }
  return { seriesList, addSeries, updateSeries, deleteSeries, getSeriesById, getSeriesProgress };
}
export {
  addSeries as a,
  findSeriesByName as f,
  useSeries as u
};
