import { H as watchEffect } from "./index-vRGsP6Kw.js";
function useHead(opts) {
  watchEffect(() => {
    document.title = typeof opts.title === "function" ? opts.title() : opts.title;
  });
}
export {
  useHead as u
};
