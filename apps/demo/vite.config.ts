import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@codex-game/engine": path.resolve(
        __dirname,
        "../../packages/engine/src/index.ts"
      )
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: {
      allow: [
        __dirname,
        path.resolve(__dirname, "../../packages/engine/src")
      ]
    }
  },
  build: {
    outDir: "dist"
  }
});
