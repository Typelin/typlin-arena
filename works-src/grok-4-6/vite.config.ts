import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/works/grok-4-6/',
  plugins: [react()],
  server: { host: '127.0.0.1' },
});
