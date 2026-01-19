/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thcs-blue': '#0052cc',
        'thcs-dark': '#003d99',
      }
    },
  },
  plugins: [],
}