import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0", // ← Allow LAN access
    port: 5173, // Optional: fixed port
  },
});
