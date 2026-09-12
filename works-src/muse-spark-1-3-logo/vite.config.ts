import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 併站用：隨 arena 部署於 /logo/muse-spark-1-3/（本地 dev 不受影響）
  base: '/logo/muse-spark-1-3/',
  plugins: [react()],
})
