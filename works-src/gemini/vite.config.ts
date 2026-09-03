import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 併站用：隨 arena 部署於 /works/gemini/（本地 dev 不受影響）
  base: '/works/gemini/',
  plugins: [react()],
  server: {
    port: 5179,
  },
  preview: {
    port: 4179,
  }
});
