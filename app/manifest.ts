import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "COM'9 — Réparation & Reconditionnement Mobile",
    short_name:       "COM'9",
    description:      "Réparation d'écrans, batteries et reconditionnement de smartphones à Nogent-le-Rotrou (28).",
    start_url:        '/',
    display:          'standalone',
    background_color: '#050816',
    theme_color:      '#050816',
    icons: [
      {
        src:   '/logo.png',
        sizes: 'any',
        type:  'image/png',
      },
    ],
  }
}
