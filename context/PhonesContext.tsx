'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Gestion centralisée des téléphones
// Source de vérité : localStorage (clé "com9_phones")
// Initialisation   : données statiques de data/phones.ts si aucune donnée sauvée
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { phones as staticPhones, type Phone } from '@/data/phones'

const STORAGE_KEY = 'com9_phones'

// ─── Types ────────────────────────────────────────────────────────────────────

type PhonesCtx = {
  phones:      Phone[]
  ready:       boolean   // false pendant l'hydratation SSR → évite le flash
  addPhone:    (phone: Phone)                    => void
  updatePhone: (id: string, data: Partial<Phone>) => void
  deletePhone: (id: string)                      => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PhonesContext = createContext<PhonesCtx | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PhonesProvider({ children }: { children: React.ReactNode }) {
  const [phones, setPhones] = useState<Phone[]>([])
  const [ready,  setReady]  = useState(false)

  // Hydratation : lecture localStorage au montage (client uniquement)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        // localStorage existe → l'utiliser (même si tableau vide = suppression volontaire)
        setPhones(JSON.parse(raw) as Phone[])
      } else {
        // Première visite → amorcer avec les données statiques
        setPhones(staticPhones)
      }
    } catch {
      setPhones(staticPhones)
    }
    setReady(true)
  }, [])

  // Persistance : toute modification est sauvée dans localStorage
  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phones))
    }
  }, [phones, ready])

  // CRUD
  const addPhone = useCallback((phone: Phone) => {
    setPhones(prev => [...prev, phone])
  }, [])

  const updatePhone = useCallback((id: string, data: Partial<Phone>) => {
    setPhones(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])

  const deletePhone = useCallback((id: string) => {
    setPhones(prev => prev.filter(p => p.id !== id))
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
