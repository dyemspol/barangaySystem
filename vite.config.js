// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/", // Keep '/' for Vercel root. Remove if you like (default is '/').
  server: {
    host: true, // same as 0.0.0.0 (LAN access)
    port: 5173,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin_page.html"),
        req: resolve(__dirname, "req_page_admin.html"),
        changePwd: resolve(__dirname, "change-pass-admin.html"),
        track: resolve(__dirname, "track-status.html"),
        find: resolve(__dirname, "find_ref.html"),
      },
    },
  },
});
