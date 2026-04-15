/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0B0C10',
        surface: '#13141A',
        s2:      '#1C1D26',
        s3:      '#222330',
        brd:     '#2A2B38',
        tx:      '#E2E3F0',
        muted:   '#6B6C82',
        dim:     '#4A4B5A',
        purple:  { DEFAULT: '#5B4FD6', light: '#C9B8FF' },
        pink:    { DEFAULT: '#E91E8C', light: '#FFB3D9' },
        teal:    { DEFAULT: '#00A896', light: '#7AFFBE' },
        grn:     '#1A8A5A',
        amb:     '#E07B00',
        dng:     { DEFAULT: '#C0392B', light: '#FFB3B3' }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'Cascadia Code', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
