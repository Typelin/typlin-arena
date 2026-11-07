import { defineConfig } from 'vite'
export default defineConfig({
  base: './',
  server: { host: '127.0.0.1' },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-core', test: /three[\\/]build[\\/]three\.core\.js/ },
            { name: 'three-renderer', test: /three[\\/]build[\\/]three\.module\.js/ },
          ],
        },
      },
    },
  },
})
