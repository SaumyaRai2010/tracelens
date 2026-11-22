/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1220',
          850: '#0F1729',
          800: '#121A2B',
          700: '#182235',
          600: '#1E2A40',
          500: '#243047',
        },
        teal: {
          400: '#2DD4BF',
          500: '#2A9D8F',
          600: '#1F7A6F',
        },
        accent: {
          blue: '#60A5FA',
          muted: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(96, 165, 250, 0.08), 0 12px 40px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
