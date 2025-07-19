/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004a8c', // A deeper, refined blue for Apex National Bank
        accent: {
          DEFAULT: '#0d9488', // teal-600
          '100': '#ccfbf1',   // teal-100
          '700': '#0f766e'    // teal-700
        },
      },
      boxShadow: {
        'top': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'loading-bar': 'loading-bar-animation 1.5s infinite linear',
      },
      keyframes: {
        'loading-bar-animation': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
        }
      }
    }
  },
  plugins: [],
}