import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://com9.fr'),

  title: {
    default: "COM'9 — Réparation & Reconditionnement Mobile | Nogent-le-Rotrou",
    template: "%s | COM'9",
  },

  description:
    "Réparation d'écrans, batteries et reconditionnement de smartphones à Nogent-le-Rotrou (28). Diagnostic officiel sur 100 points. iPhone · Samsung · Tous modèles.",

  keywords: [
    'réparation téléphone Nogent-le-Rotrou',
    'réparation iPhone 28',
    'réparation écran smartphone',
    'remplacement batterie iPhone',
    'reconditionnement téléphone',
    'diagnostic smartphone',
    'réparation mobile Eure-et-Loir',
    'COM9',
  ],

  authors:  [{ name: "COM'9" }],
  creator:  "COM'9",

  openGraph: {
    title:       "COM'9 — Réparation & Reconditionnement Mobile",
    description: "Réparation d'écrans, batteries et reconditionnement de smartphones à Nogent-le-Rotrou. Diagnostic officiel sur 100 points.",
    type:        'website',
    locale:      'fr_FR',
    url:         'https://com9.fr',
    siteName:    "COM'9",
    images: [
      {
        url:    '/og-image.png',   // à créer : 1200×630px
        width:  1200,
        height: 630,
        alt:    "COM'9 — Next Generation Mobile Systems",
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       "COM'9 — Réparation Mobile | Nogent-le-Rotrou",
    description: "Réparation écrans & batteries · Reconditionnement · Diagnostic 100 points.",
  },

  icons: {
    icon:     [{ url: '/logo.png', type: 'image/png' }],
    apple:    [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
  },

  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="bg-space-black text-cold-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
