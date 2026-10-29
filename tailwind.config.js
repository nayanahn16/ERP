/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8eb9ff',
          400: '#5992fe',
          500: '#2563eb', // Electric Indigo / Cobalt
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e378a',
          900: '#0f172a', // Deep navy
          950: '#020617'
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#0b0f19'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
