/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A365D',
        secondary: '#2B6CB0',
        accent: '#48BB78',
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
