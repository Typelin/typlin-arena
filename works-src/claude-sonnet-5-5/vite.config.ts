import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 相對路徑 base：可從任何子路徑提供服務。
export default defineConfig({
  base: './',
  plugins: [react()],
})
