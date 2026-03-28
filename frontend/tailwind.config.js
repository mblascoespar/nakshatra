/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        favorable:   { DEFAULT: '#16a34a', light: '#dcfce7', text: '#14532d' },
        neutral:     { DEFAULT: '#6b7280', light: '#f3f4f6', text: '#374151' },
        unfavorable: { DEFAULT: '#dc2626', light: '#fee2e2', text: '#7f1d1d' },
      },
    },
  },
  plugins: [],
}
