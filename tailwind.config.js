/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mustard: {
          50: '#FBF3DF', 100: '#F7E7BE', 200: '#F0D388', 300: '#E9C066',
          400: '#E5B64D', 500: '#D4A23B', 600: '#B8862E', 700: '#936824', 800: '#6E4D1B', 900: '#4A3312',
        },
        dusty: {
          50: '#FBEDF1', 100: '#F6D9E2', 200: '#EDB3C6', 300: '#E7A6B7',
          400: '#D9829C', 500: '#C45F7E', 600: '#A04861', 700: '#7C374A', 800: '#582734', 900: '#3A1A23',
        },
        cream: '#FAF8F4',
        ink: '#3F302B',
        sage: '#AFC7A1',
        graysoft: '#8B8B8B',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
