/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FAF8F5',
          blue: '#b91a30', // Traditional Torii Crimson Red
          dark: '#1a202c',  // Sumi Ink Charcoal
          card: 'rgba(255, 255, 255, 0.78)', // Elegant glass washi panels
          border: 'rgba(185, 26, 48, 0.12)', // Subtle Torii-infused border lines
          success: '#2e7d32', // Bamboo Green
          danger: '#c62828',  // Imperial Crimson
          warning: '#f9a825',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
