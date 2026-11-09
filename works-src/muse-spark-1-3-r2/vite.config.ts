import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed under /works/muse-spark-1-3-r2/ on the Arena site.
// Relative base keeps every asset path relative, as the brief requires.
export default defineConfig({
  base: './',
  plugins: [react()],
})
