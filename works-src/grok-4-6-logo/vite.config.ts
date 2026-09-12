import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/logo/grok-4-6/',
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: true,
  },
  preview: {
    port: 4188,
    strictPort: true,
  },
})
