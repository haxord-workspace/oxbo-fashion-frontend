/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        white: '#ffffff',
        gray: {
          100: '#f7f7f7',
          200: '#eeeeee',
          300: '#dddddd',
          400: '#cccccc',
          500: '#999999',
          600: '#666666',
          700: '#333333',
          800: '#222222',
          900: '#111111',
        },
      },
    },
  },
  plugins: [],
}
