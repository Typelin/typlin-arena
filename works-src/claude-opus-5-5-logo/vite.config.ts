import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base: the build works when served from any sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
})
