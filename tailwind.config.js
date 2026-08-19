/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Base ardoise lumineuse ──
        'space-black':   '#0f1929',   // fond principal
        'space-deep':    '#0b1220',   // fond bas de page
        'slate-lift':    '#16233a',   // surface élevée opaque

        // ── Accent Com'9 ──
        'neon-blue':     '#3ad9ff',
        'electric-blue': '#1aa9ff',

        // ── Texte ──
        'cold-white':    '#ffffff',
      },
      fontFamily: {
        space: ['var(--font-space-grotesk)', 'sans-serif'],
        mono:  ['var(--font-space-mono)', 'monospace'],
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
