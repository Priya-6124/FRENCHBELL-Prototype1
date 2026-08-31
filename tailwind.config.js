/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        french: {
          dark: '#1F110A',
          brown: '#331B10',
          warm: '#4E2A1A',
          cream: '#FAF5ED',
          card: '#FFFDF9',
          gold: '#D4AF37',
          'gold-hover': '#E5BF45',
          'gold-light': '#F8F1D7',
          amber: '#E07A5F',
          muted: '#8C7A6B',
          green: '#2E7D32',
          red: '#C62828',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        display: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        bellSwing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(18deg)' },
          '30%': { transform: 'rotate(-15deg)' },
          '45%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-7deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        steamRise: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0.2' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-24px) scale(1.3)', opacity: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.8)' },
        }
      },
      animation: {
        'bell-swing': 'bellSwing 1.6s ease-in-out infinite',
        'steam': 'steamRise 2.5s ease-out infinite',
        'float': 'floatSlow 4s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s infinite',
      }
    },
  },
  plugins: [],
}
