/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#12324A',
        ocean: '#1F4C6B',
        foam: '#F5F7FA',
        sand: '#D7B56D',
        gold: '#C9A14A',
        mist: '#E8EEF3',
        ink: '#0D2235',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(18, 50, 74, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}