import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/works/glm-5-3/',
  plugins: [react()],
});
