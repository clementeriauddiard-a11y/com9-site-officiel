import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "COM'9 — Réparation de smartphone à domicile",
    short_name:       "COM'9",
    description:      "Votre smartphone réparé sans vous déplacer, dans notre atelier mobile, jusqu'à 23h. Nogent-le-Rotrou et alentours.",
    start_url:        '/',
    display:          'standalone',
    background_color: '#0f0f11',
    theme_color:      '#0f0f11',
    icons: [
      {
        src:   '/logo.png',
        sizes: 'any',
        type:  'image/png',
      },
    ],
  }
}
