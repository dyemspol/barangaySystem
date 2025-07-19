import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        adminLogin: resolve(__dirname, "admin.html"),
        adminPage: resolve(__dirname, "admin_page.html"),
        adminSecret: resolve(__dirname, "admin-$ecretKkey.html"),
        adminchangePass: resolve(__dirname, "change-pass-admin.html"),
        findRef: resolve(__dirname, "find_ref.html"),
        otp: resolve(__dirname, "OTP.html"),
        reqPageAdmin: resolve(__dirname, "req_page_admin.html"),
        trackStatus: resolve(__dirname, "track-status.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0", // Allow LAN access
    port: 5173, // Optional: fixed port
  },
  base: "./",
});
