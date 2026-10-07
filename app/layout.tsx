import type { Metadata, Viewport } from 'next'
// Polices Geist livrées avec le site (aucun appel externe au chargement).
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import { HORAIRES_TEXTE } from '@/config/com9'

// Écriture manuscrite (accents décoratifs) — Caveat, licence SIL OFL, fichier local.
const script = localFont({ src: './fonts/Caveat-500.woff2', weight: '500', variable: '--font-script', display: 'swap' })

const DESCRIPTION =
  `Réparation de smartphone à domicile autour de Nogent-le-Rotrou, ${HORAIRES_TEXTE.accroche.toLowerCase()}. ` +
  'Écran, batterie, vitre arrière : choisissez votre réparation, voyez le prix total et réservez votre créneau. COM\'9 vient chez vous.'

export const metadata: Metadata = {
  metadataBase: new URL('https://com9.fr'),

  title: {
    default: "COM'9 — Votre smartphone réparé chez vous | Nogent-le-Rotrou",
    template: "%s | COM'9",
  },

  description: DESCRIPTION,

  keywords: [
    'réparation smartphone à domicile',
    'réparation iPhone à domicile',
    'réparation téléphone Nogent-le-Rotrou',
    'réparation écran iPhone',
    'remplacement batterie iPhone',
    'réparation le soir',
    'Perche',
    'Eure-et-Loir',
    'COM9',
  ],

  authors:  [{ name: "COM'9" }],
  creator:  "COM'9",

  openGraph: {
    title:       "COM'9 — Votre smartphone réparé chez vous",
    description: DESCRIPTION,
    type:        'website',
    locale:      'fr_FR',
    url:         'https://com9.fr',
    siteName:    "COM'9",
  },

  twitter: {
    card:        'summary',
    title:       "COM'9 — Votre smartphone réparé chez vous",
    description: `Réparation à domicile ${HORAIRES_TEXTE.accroche.toLowerCase()}. On vient à vous.`,
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

export const viewport: Viewport = {
  themeColor: '#0f0f11',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable} ${script.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
