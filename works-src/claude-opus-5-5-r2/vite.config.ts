import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 使用相對路徑，部署在任何子路徑（例如 /works/<slug>/）都能正確載入資源。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
  },
})
