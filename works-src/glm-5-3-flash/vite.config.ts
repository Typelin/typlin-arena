import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 併站用：隨 arena 部署於 /works/glm-5-3-flash/（本地 dev 不受影響）
  base: "/works/glm-5-3-flash/",
  plugins: [react()],
});
