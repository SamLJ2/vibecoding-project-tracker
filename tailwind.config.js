/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand (DESIGN.md §2)
        brand: {
          primary: '#3D3A8C',
          accent: '#F2A93B',
        },
        surface: {
          page: '#F6F4EF',
          card: '#FFFFFF',
        },
        text: {
          primary: '#1C1B29',
          muted: '#6B6880',
        },
        // Task type (M6 tag-style)
        type: {
          feature: '#0E9F7E',
          bug: '#D9455F',
        },
        // Due-date states (M8 due-tint)
        due: {
          safe: '#DCE8F7',
          warning: '#FCE3A8',
          overdue: '#F9C5CB',
          neutral: '#E7E5E4',
        },
        // Backwards-compatible aliases from the starter
        feature: '#0E9F7E',
        bug: '#D9455F',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
