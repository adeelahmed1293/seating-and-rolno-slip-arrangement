/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        navy: {
          darkest: '#0e1929',
          dark: '#132030',
          mid: '#19293d',
          light: '#1e3350',
          border: '#274468',
        },
        steel: {
          DEFAULT: '#4a7fb5',
          light: '#6b9fd4',
          pale: '#8fb8e0',
        },
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-rev': 'float 4s ease-in-out infinite reverse',
        'grid-scroll': 'gridScroll 12s linear infinite',
        'pulse-ring': 'pulseRing 2.5s ease-in-out infinite',
        'spin-slow': 'spin 0.75s linear infinite',
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-left': 'fadeLeft 0.38s ease both',
        'fade-right': 'fadeRight 0.38s ease both',
        'scale-in': 'scaleIn 0.65s 0.1s ease both',
        'shake': 'shake 0.38s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gridScroll: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '40px 40px' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74,127,181,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(74,127,181,0.15)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-7px)' },
          '40%': { transform: 'translateX(7px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
      boxShadow: {
        'accent-glow': '0 0 28px rgba(74,127,181,0.2)',
        'steel-glow': '0 0 8px rgba(74,127,181,0.35)',
        'btn': '0 4px 18px rgba(42,95,160,0.45)',
        'btn-hover': '0 8px 28px rgba(42,95,160,0.55)',
      },
    },
  },
  plugins: [],
}
