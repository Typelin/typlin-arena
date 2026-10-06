import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/logo/mimo-v2.6-flash/',
  plugins: [react()],
  server: {
    port: 5178,
  },
  preview: {
    port: 4178,
  },
})
