/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#08090c',
        slateblack: '#0f1117',
        chamber: {
          bg: '#08090c',
          card: 'rgba(18, 20, 29, 0.72)',
          border: 'rgba(255, 255, 255, 0.08)',
          amber: '#e28a2b',
          teal: '#2dd4bf',
          gold: '#f59e0b',
          violet: '#a78bfa',
          mist: '#94a3b8'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
