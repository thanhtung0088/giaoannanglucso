/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thcs-blue': '#1e40af', // Màu xanh đậm THCS
        'thcs-light': '#3b82f6',
      }
    },
  },
  plugins: [],
}