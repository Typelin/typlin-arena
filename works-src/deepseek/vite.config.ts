import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/works/deepseek/',
  plugins: [react()],
  build: {
    outDir: '../../public/works/deepseek',
    emptyOutDir: true,
  },
});
