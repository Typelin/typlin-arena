import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Self-hosted fonts, no external services; keep the page origin-clean.
export default defineConfig({
  // 併站用：隨 arena 部署於 /works/qw27/（本地 dev 不受影響）
  base: '/works/qw27/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
