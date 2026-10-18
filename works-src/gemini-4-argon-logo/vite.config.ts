import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/logo/gemini-4-argon/',
  plugins: [react()],
});
