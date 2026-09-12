import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 併站部署路徑：/logo/deepseek-v4-1-flash/
  base: '/logo/deepseek-v4-1-flash/',
  plugins: [react()],
  server: {
    port: 5188,
  },
  preview: {
    port: 4188,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
})
