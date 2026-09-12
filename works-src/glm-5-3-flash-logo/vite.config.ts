import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 併站用：隨 arena 部署於 /logo/glm-5-3-flash/（本地 dev 不受影響）
  base: '/logo/glm-5-3-flash/',
  plugins: [react()],
})
