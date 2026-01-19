import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import copyRedirects from "./vite-plugin-copy-redirects.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyRedirects()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    copyPublicDir: true,
  },
  publicDir: "public",
});
