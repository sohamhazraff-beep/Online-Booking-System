/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a0f',
          900: '#0c1017',
          850: '#111722',
          800: '#161f2e',
          700: '#222f44',
          600: '#33435c',
        },
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        accent: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-accent': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
