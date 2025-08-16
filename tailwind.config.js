/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f5',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#2f80ed',
          light: '#4fa3ff',
          dark: '#1d5dbf',
        },
        secondary: '#f0f0f0',
      },
    },
  },
  plugins: [],
};