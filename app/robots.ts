import { MetadataRoute } from 'next'

/**
 * Génère automatiquement /robots.txt
 * Les pages privées sont exclues de l'indexation.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/responsable',
          '/responsable/',
          '/diagnostic-premium',
          '/diagnostic-premium/',
        ],
      },
    ],
    sitemap: 'https://com9.fr/sitemap.xml',
  }
}
