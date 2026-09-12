import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // 併站用：隨 arena 部署於 /works/qwen-3-8-flash/（本地 dev 不受影響）
  base: "/works/qwen-3-8-flash/",
  server: {
    port: 5178,
    strictPort: true,
  },
  preview: {
    port: 4178,
    strictPort: true,
  },
});
