/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './boi-school/**/*.{vue,html}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185', 500: '#f43f5e',
          600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
