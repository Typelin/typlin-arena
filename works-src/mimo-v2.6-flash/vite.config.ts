import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/works/mimo-v2.6-flash/',
  plugins: [react()],
})
