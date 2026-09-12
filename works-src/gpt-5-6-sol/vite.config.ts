import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/works/gpt-5-6-sol/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 900 },
});
