import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import posthtml from "posthtml";
import posthtmlInclude from "posthtml-include";

const root = resolve(__dirname);

function htmlPartials() {
  return {
    name: "html-partials",
    async transformIndexHtml(html) {
      const result = await posthtml([posthtmlInclude({ root })]).process(html);
      return result.html;
    },
  };
}

export default defineConfig({
  root,
  base: "/",
  plugins: [tailwindcss(), htmlPartials()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        about: resolve(root, "about.html"),
        subjects: resolve(root, "subjects.html"),
        masterclasses: resolve(root, "masterclasses.html"),
        contact: resolve(root, "contact.html"),
        privacy: resolve(root, "privacy.html"),
        terms: resolve(root, "terms.html"),
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
