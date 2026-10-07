import { SITE_URL } from '@/config/com9'
import { MetadataRoute } from 'next'

/**
 * Génère automatiquement /sitemap.xml
 * Seules les pages publiques sont indexées.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/reservation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
