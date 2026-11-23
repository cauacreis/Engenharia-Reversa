/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        abyss: 'var(--bg-abyss)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        stroke: 'var(--border-subtle)',
        ink: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        duo: {
          green: '#58CC02',
          greenShade: '#46A302',
          amber: '#FF9600',
          amberShade: '#CC7800',
          cyan: '#00B8FF',
          cyanShade: '#0088C2',
          teal: '#14B8A6',
          tealShade: '#0D8A7B',
          red: '#FF4B4B',
          redShade: '#CC2E2E',
          gold: '#FFC800',
          goldShade: '#D19D00',
        },
      },
      boxShadow: {
        tactile: '0 4px 0 0 rgba(0, 0, 0, 0.35)',
        glowGreen: '0 0 28px rgba(88, 204, 2, 0.28)',
        glowCyan: '0 0 28px rgba(0, 184, 255, 0.25)',
      },
    },
  },
  plugins: [],
};
