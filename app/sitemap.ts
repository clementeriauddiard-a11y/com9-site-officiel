import { MetadataRoute } from 'next'

/**
 * Génère automatiquement /sitemap.xml
 * Seules les pages publiques sont indexées.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://com9.fr'

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
