import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 相對路徑：作品掛在 /works/<資料夾名稱>/ 底下，base 不寫死。
export default defineConfig({
  base: './',
  plugins: [react()],
})
