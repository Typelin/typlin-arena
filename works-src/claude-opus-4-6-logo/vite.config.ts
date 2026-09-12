import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 併站用：隨 arena 部署於 /logo/claude-opus-4-6/（本地 dev 不受影響）
  base: '/logo/claude-opus-4-6/',
  plugins: [react()],
  server: {
    port: 5178,
    open: true,
  },
  preview: {
    port: 4178,
  },
})
