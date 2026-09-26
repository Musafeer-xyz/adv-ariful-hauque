/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#0B1B33',
          100: '#0F2140',
          200: '#16294A',
          300: '#1F3A63',
        },
        brass: {
          50: '#A9812F',
          100: '#C9A448',
          200: '#8A6A26',
        },
        background: {
          50: '#F7F4EC',
          100: '#EFE8D8',
        },
        body: '#1C1D21',
      },
      fontFamily: {
        'bengali-heading': ['Noto Serif Bengali', 'serif'],
        'bengali-body': ['Hind Siliguri', 'sans-serif'],
        'english-heading': ['Source Serif 4', 'serif'],
        'english-body': ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
