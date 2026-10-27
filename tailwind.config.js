/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Every colour reads a CSS variable defined in src/index.css, so the
      // whole app switches between light and dark.
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          text: 'rgb(var(--brand-text) / <alpha-value>)', // brand colour for TEXT (lighter in dark mode)
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
        },
        surface: {
          page: 'rgb(var(--surface-page) / <alpha-value>)',
          card: 'rgb(var(--surface-card) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        type: {
          feature: 'rgb(var(--type-feature) / <alpha-value>)',
          bug: 'rgb(var(--type-bug) / <alpha-value>)',
          'feature-text': 'rgb(var(--type-feature-text) / <alpha-value>)',
          'bug-text': 'rgb(var(--type-bug-text) / <alpha-value>)',
        },
        due: {
          safe: 'rgb(var(--due-safe) / <alpha-value>)',
          warning: 'rgb(var(--due-warning) / <alpha-value>)',
          overdue: 'rgb(var(--due-overdue) / <alpha-value>)',
          neutral: 'rgb(var(--due-neutral) / <alpha-value>)',
        },
        // Greys used for borders, hovers and column backgrounds.
        stone: {
          100: 'rgb(var(--stone-100) / <alpha-value>)',
          200: 'rgb(var(--stone-200) / <alpha-value>)',
          300: 'rgb(var(--stone-300) / <alpha-value>)',
        },
        // Backwards-compatible aliases from the starter
        feature: 'rgb(var(--type-feature) / <alpha-value>)',
        bug: 'rgb(var(--type-bug) / <alpha-value>)',
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
