import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  server: {
    host: "0.0.0.0", // ← Allow LAN access
    port: 5173, // Optional: fixed port
  },
  base: "./",
});
