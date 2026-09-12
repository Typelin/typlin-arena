import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/logo/gpt-5-6-sol/',
  plugins: [react()],
  server: {
    port: 5178,
    strictPort: true,
  },
  preview: {
    port: 4178,
    strictPort: true,
  },
});
