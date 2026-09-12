import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5183,
    open: false,
  },
  preview: {
    port: 4183,
  },
})
