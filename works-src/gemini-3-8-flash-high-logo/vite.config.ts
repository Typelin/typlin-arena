import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 併站用：隨 arena 部署於 /logo/gemini-3-8-flash-high/（本地 dev 不受影響）
  base: '/logo/gemini-3-8-flash-high/',
  plugins: [react()],
  server: {
    port: 5178,
    host: true
  }
});
