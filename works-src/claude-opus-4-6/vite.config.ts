import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 併站用：隨 arena 部署於 /works/claude-opus-4-6/（本地 dev 不受影響）
  base: '/works/claude-opus-4-6/',
  plugins: [react()],
})
