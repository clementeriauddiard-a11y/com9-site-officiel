'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Gestion centralisée des téléphones
// Source de vérité : API /api/phones (Vercel Blob, côté serveur)
// Visible par tous les visiteurs sur tous les appareils.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Phone } from '@/data/phones'

// ─── Types ────────────────────────────────────────────────────────────────────

type PhonesCtx = {
  phones:      Phone[]
  ready:       boolean   // false pendant le chargement initial
  addPhone:    (phone: Phone)                     => Promise<void>
  updatePhone: (id: string, data: Partial<Phone>) => Promise<void>
  deletePhone: (id: string)                       => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PhonesContext = createContext<PhonesCtx | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PhonesProvider({ children }: { children: React.ReactNode }) {
  const [phones, setPhones] = useState<Phone[]>([])
  const [ready,  setReady]  = useState(false)

  // Chargement initial depuis l'API (données partagées entre tous les appareils)
  useEffect(() => {
    fetch('/api/phones')
      .then(r => r.ok ? r.json() : [])
      .then((data: Phone[]) => {
        setPhones(data)
        setReady(true)
      })
      .catch(() => {
        setPhones([])
        setReady(true)
      })
  }, [])

  // ─── CRUD (toutes les mutations passent par l'API) ─────────────────────────

  const addPhone = useCallback(async (phone: Phone) => {
    const res = await fetch('/api/phones', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(phone),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Erreur lors de l\'ajout')
    }
    const updated = (await res.json()) as Phone[]
    setPhones(updated)
  }, [])

  const updatePhone = useCallback(async (id: string, data: Partial<Phone>) => {
    const res = await fetch(`/api/phones/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Erreur lors de la mise à jour')
    }
    const updated = (await res.json()) as Phone[]
    setPhones(updated)
  }, [])

  const deletePhone = useCallback(async (id: string) => {
    const res = await fetch(`/api/phones/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Erreur lors de la suppression')
    }
    const updated = (await res.json()) as Phone[]
    setPhones(updated)
  }, [])

  return (
    <PhonesContext.Provider value={{ phones, ready, addPhone, updatePhone, deletePhone }}>
      {children}
    </PhonesContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePhones(): PhonesCtx {
  const ctx = useContext(PhonesContext)
  if (!ctx) throw new Error('usePhones doit être utilisé dans un PhonesProvider')
  return ctx
}
