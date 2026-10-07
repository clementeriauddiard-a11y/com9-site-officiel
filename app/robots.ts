import { SITE_URL } from '@/config/com9'
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
          '/suivi/',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
