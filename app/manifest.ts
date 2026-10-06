import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "COM'9 — Réparation de smartphone à domicile",
    short_name:       "COM'9",
    description:      "Votre smartphone réparé chez vous, jusqu'à 23h. Nogent-le-Rotrou et alentours.",
    start_url:        '/',
    display:          'standalone',
    background_color: '#0f0f11',
    theme_color:      '#0f0f11',
    icons: [
      { src: '/logo-com9-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo-com9-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
