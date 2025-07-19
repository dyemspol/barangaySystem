import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
        adminLogin: resolve(__dirname, "admin-login.html"),
        adminDashboard: resolve(__dirname, "admin-dashboard.html"),
        track: resolve(__dirname, "track-status.html"),
        find: resolve(__dirname, "find_ref.html"),
      },
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    host: "0.0.0.0", // ← Allow LAN access
    port: 5173, // Optional: fixed port
  },
  base: "./",
});
