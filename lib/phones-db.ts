// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Base de données téléphones (Vercel Blob)
//
// Les téléphones sont stockés dans Vercel Blob sous la forme d'un fichier JSON.
// En local (sans BLOB_READ_WRITE_TOKEN), utilise un stockage en mémoire.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phone } from '@/data/phones'

// Pathname fixe dans le store Blob
const DATA_PATHNAME = 'com9-phones-data.json'

// Fallback mémoire pour dev local (réinitialisé à chaque redémarrage serveur)
let _memPhones: Phone[] | null = null

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getPhones(): Promise<Phone[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Dev local : retourne les données en mémoire (vide au départ)
    return _memPhones ? [..._memPhones] : []
  }

  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: DATA_PATHNAME })
    const blob = blobs.find(b => b.pathname === DATA_PATHNAME)
    if (!blob) return []

    const res = await fetch(blob.url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    return (await res.json()) as Phone[]
  } catch {
    return []
  }
}

// ─── Écriture (remplace tout le tableau) ──────────────────────────────────────

export async function savePhones(phones: Phone[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    _memPhones = [...phones]
    return
  }

  const { put } = await import('@vercel/blob')
  await put(DATA_PATHNAME, JSON.stringify(phones), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  })
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export async function addPhone(phone: Phone): Promise<Phone[]> {
  const phones = await getPhones()
  const updated = [...phones, phone]
  await savePhones(updated)
  return updated
}

export async function updatePhone(id: string, data: Partial<Phone>): Promise<Phone[]> {
  const phones = await getPhones()
  const updated = phones.map(p => p.id === id ? { ...p, ...data } : p)
  await savePhones(updated)
  return updated
}

export async function deletePhone(id: string): Promise<Phone[]> {
  const phones = await getPhones()
  const updated = phones.filter(p => p.id !== id)
  await savePhones(updated)
  return updated
}
