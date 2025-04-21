import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      esbuild: {
        jsxImportSource: "hono/jsx/dom", // Optimized for hono/jsx/dom
      },
      build: {
        rollupOptions: {
          input: "./src/client/index.tsx",
          output: {
            entryFileNames: "static/client.js",
          },
        },
      },
    };
  }

  return {
    plugins: [
      pages({
        entry: "src/index.tsx",
        outputDir: "dist",
      }),
      devServer({
        entry: "src/index.tsx",
      }),
    ],
  };
});
