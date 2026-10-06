/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Headers de sécurité ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Lien de suivi client : le jeton est dans l'adresse. Il ne doit jamais
      // partir vers un autre site (Referer), ni être indexé, ni mis en cache.
      {
        source: '/suivi/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag',    value: 'noindex, nofollow' },
          { key: 'Cache-Control',   value: 'private, no-store' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
