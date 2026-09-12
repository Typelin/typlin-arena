import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/logo/qwen-3-8-27b-local/',
  plugins: [react()],
})
