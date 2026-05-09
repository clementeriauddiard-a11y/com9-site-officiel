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
        'space-black': '#050816',
        'neon-blue': '#00D1FF',
        'electric-blue': '#0066FF',
        'cold-white': '#FFFFFF',
      },
      fontFamily: {
        space: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': {
            textShadow:
              '0 0 20px rgba(0,209,255,0.5), 0 0 40px rgba(0,209,255,0.3), 0 0 80px rgba(0,102,255,0.2)',
          },
          '50%': {
            textShadow:
              '0 0 40px rgba(0,209,255,0.9), 0 0 80px rgba(0,209,255,0.6), 0 0 120px rgba(0,102,255,0.4)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'scan-line': 'scanLine 10s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
