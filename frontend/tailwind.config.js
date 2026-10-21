/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#193f35',
        lime: '#d2f56a',
        paper: '#f8faf9',
        ink: '#202a25',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -28px rgba(18, 45, 55, 0.22)',
      },
      letterSpacing: {
        tighter2: '-0.045em',
      },
    },
  },
  plugins: [],
}
