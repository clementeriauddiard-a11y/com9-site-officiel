/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Palier supplémentaire pour les très petits téléphones (iPhone SE, 360px)
      screens: {
        xs: '380px',
      },
      colors: {
        // Anciens noms conservés, alignés sur la nouvelle palette (charbon / bleu COM'9).
        'space-black':   '#0f0f11',
        'space-deep':    '#0a0a0b',
        'slate-lift':    '#17171a',
        'neon-blue':     '#0a74d6',
        'electric-blue': '#0a74d6',
        'cold-white':    '#f5f2ec',
      },
      fontFamily: {
        space: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        c9: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        // Seules animations conservées : apparition douce et respiration lente.
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        float:     'float 7s ease-in-out infinite',
        blink:     'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
