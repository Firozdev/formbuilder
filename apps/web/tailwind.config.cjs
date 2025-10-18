/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f2f9ff',
          100: '#e0f2ff',
          200: '#b9e3ff',
          300: '#7eccff',
          400: '#37b0ff',
          500: '#0d94ff',
          600: '#0073db',
          700: '#0058ad',
          800: '#004487',
          900: '#003771'
        }
      }
    }
  },
  plugins: []
};
