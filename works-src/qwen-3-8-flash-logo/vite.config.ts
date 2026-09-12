import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 併站用：隨 arena 部署於 /logo/qwen-3-8-flash/（本地 dev 不受影響）
  base: '/logo/qwen-3-8-flash/',
  plugins: [react()],
  server: { port: 5178 },
  preview: { port: 4178 }
});
