import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/works/deepseek-v4-1-flash/',
  plugins: [react()],
});
