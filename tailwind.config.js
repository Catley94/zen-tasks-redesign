/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: '#f6f2e8',
        'bg-soft': '#f1ecdd',
        surface: '#fbf7ee',
        'surface-alt': '#fdfaf3',
        // Ink
        ink: '#2a2e26',
        'ink-soft': '#4a4e45',
        sub: '#6b6e63',
        'sub-soft': '#8a8d82',
        // Lines
        line: '#e6ddc9',
        'line-soft': '#efe8d6',
        'line-softer': '#f3edde',
        // Forest greens (primary)
        green: {
          DEFAULT: '#3f6e3a',
          deep: '#2d5228',
          soft: '#d6e2cb',
          tint: '#ebf1e2',
          accent: '#5a8a3a',
        },
        // Turquoise (secondary / AI / focus)
        teal: {
          DEFAULT: '#2a8a8a',
          deep: '#1f6a6a',
          soft: '#c8e0e0',
          tint: '#e0ecec',
        },
        // States
        warn: {
          DEFAULT: '#b8733a',
          soft: '#f1e1cf',
        },
        rose: '#9a4a4a',
        // Priority
        seedling: '#a8b89a',
        growing: '#6b9a4e',
        rooted: '#3f6e3a',
        falling: '#b8733a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['EB Garamond', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
