/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4f0',
          100: '#ffe3d8',
          200: '#ffc4aa',
          400: '#f08060',
          500: '#D85A30',
          600: '#b84520',
          700: '#993C1D',
          800: '#7a2e14',
          900: '#4A1B0C',
        }
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
