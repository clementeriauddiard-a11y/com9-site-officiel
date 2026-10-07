'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Choix du smartphone : marque → famille / recherche → modèle
//
//  Tout vient de data/catalogue.ts. Une marque sans grille (Xiaomi, Pixel…),
//  « Autre marque » ou « Je ne trouve pas mon modèle » mènent à une saisie
//  libre : le client demande son tarif, il n'est jamais bloqué.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import {
  BRANDS, findBrand, modelsOf, searchModels,
  type BrandId, type CatalogModel,
} from '@/data/catalogue'
import { Btn, Choice, Field, Notice, inputCls, inputStyle } from '@/components/ui/kit'
import { IconCheck, IconSearch } from '@/components/ui/icons'

export type Device =
  | { kind: 'catalogue'; brand: BrandId; model: CatalogModel }
  | { kind: 'manual'; brand: BrandId; brandName: string; model: string; reference: string }

/** Nom complet enregistré dans la demande (« Samsung Galaxy A55 », « Xiaomi Redmi Note 13 »). */
export function deviceLabel(d: Device | null): string {
  if (!d) return ''
  if (d.kind === 'catalogue') return d.model.label
  const model = d.model.trim().replace(/\s+/g, ' ')
  const brand = d.brandName.trim()
  if (!brand) return model
  const already = model.toLowerCase().includes(brand.toLowerCase()) || (d.brand === 'apple' && /iphone/i.test(model))
  return already ? model : `${brand} ${model}`
}

type Mode = 'brands' | 'catalogue' | 'manual'

export default function DevicePicker({ value, onChange }: {
  value: Device | null
  onChange: (d: Device) => void
}) {
  const [brand, setBrand] = useState<BrandId | null>(value?.brand ?? null)
  const b = findBrand(brand)
  const [mode, setMode] = useState<Mode>(!value ? 'brands' : value.kind === 'manual' ? 'manual' : 'catalogue')
  const [family, setFamily] = useState<string | null>(value?.kind === 'catalogue' ? value.model.family : null)
  const [query, setQuery] = useState('')

  // Saisie libre
  const [brandName, setBrandName] = useState(value?.kind === 'manual' ? value.brandName : '')
  const [model, setModel] = useState(value?.kind === 'manual' ? value.model : '')
  const [reference, setReference] = useState(value?.kind === 'manual' ? value.reference : '')

  useEffect(() => { setQuery('') }, [brand])

  const results = useMemo(() => (brand && query ? searchModels(brand, query) : []), [brand, query])
  const familyModels = useMemo(() => (brand && family ? modelsOf(brand, family) : []), [brand, family])
  const selectedId = value?.kind === 'catalogue' ? value.model.id : null

  function pickBrand(id: BrandId) {
    const nb = findBrand(id)
    setBrand(id)
    setFamily(null)
    if (nb?.catalogue) { setMode('catalogue'); return }
    setBrandName(id === 'autre' ? '' : nb?.prefix ?? '')
    setModel('')
    setReference('')
    setMode('manual')
  }

  function notFound() {
    setBrandName(b?.prefix || b?.label || '')
    setModel(query.trim())
    setReference('')
    setMode('manual')
  }

  const pick = (id: string) => {
    const m = [...results, ...familyModels].find((x) => x.id === id)
    if (m && brand) onChange({ kind: 'catalogue', brand, model: m })
  }

  const back = (label: string, to: () => void) => (
    <button type="button" onClick={to} className="self-start rounded-lg text-[0.9375rem] font-medium"
      style={{ color: 'var(--c9-text-2)', minHeight: 40 }}>
      <span aria-hidden="true">←</span> <span className="underline underline-offset-4">{label}</span>
    </button>
  )

  // ─── 1. Marque ───
  if (mode === 'brands' || !b) {
    return (
      <div className="flex flex-col gap-4" data-brand-picker>
        <p className="text-[1.0625rem] font-medium" style={{ color: 'var(--c9-text)' }}>Quelle est la marque de votre smartphone ?</p>
        <Choice name="Marque" columns={2} minWidth="9rem" size="lg" value={brand}
          onChange={pickBrand}
          options={BRANDS.map((x) => ({
            id: x.id,
            label: <span className="text-[1.0625rem] tracking-[-0.01em]">{x.label}</span>,
            sub: x.id === 'apple' ? 'iPhone' : x.id === 'samsung' ? 'Galaxy A, S et Z' : x.id === 'autre' ? 'Tout autre smartphone' : 'Tarif sur demande',
          }))} />
      </div>
    )
  }

  // ─── 3. Saisie libre (marque sans grille, autre marque, modèle introuvable) ───
  if (mode === 'manual') {
    const enrich = !b.catalogue && b.id !== 'autre'
    const ok = model.trim().length >= 2 && (b.id !== 'autre' || brandName.trim().length >= 2)
    return (
      <div className="flex flex-col gap-4" data-manual-device>
        {back(b.catalogue ? `Revenir au catalogue ${b.label}` : 'Changer de marque', () => setMode(b.catalogue ? 'catalogue' : 'brands'))}
        {enrich ? (
          <Notice tone="accent" title="Notre catalogue est en cours d’enrichissement.">
            Indiquez votre modèle : COM&apos;9 vous communique votre tarif avant toute intervention.
          </Notice>
        ) : b.catalogue ? (
          <Notice tone="accent" title="Je ne trouve pas mon modèle">
            Indiquez-le ci-dessous : COM&apos;9 vous communique votre tarif avant toute intervention.
          </Notice>
        ) : (
          <p className="leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
            Indiquez la marque et le modèle : COM&apos;9 vous communique votre tarif avant toute intervention.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {(b.id === 'autre' || b.catalogue) && (
            <Field label="Marque" htmlFor="d-brand">
              <input id="d-brand" className={inputCls} style={inputStyle} maxLength={30} value={brandName}
                placeholder="Ex. Motorola" onChange={(e) => setBrandName(e.target.value)} />
            </Field>
          )}
          <Field label="Modèle" htmlFor="d-model">
            <input id="d-model" className={inputCls} style={inputStyle} maxLength={60} value={model}
              placeholder={b.id === 'xiaomi' ? 'Ex. Redmi Note 13' : b.id === 'pixel' ? 'Ex. Pixel 8' : b.id === 'samsung' ? 'Ex. Galaxy A05s' : 'Ex. modèle exact'}
              onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label="Référence exacte" htmlFor="d-ref" optional hint="Si vous la connaissez : Réglages › À propos du téléphone.">
            <input id="d-ref" className={inputCls} style={inputStyle} maxLength={60} value={reference}
              placeholder={b.id === 'samsung' ? 'Ex. SM-A556B' : ''} onChange={(e) => setReference(e.target.value)} />
          </Field>
        </div>
        <Btn variant="primary" size="lg" disabled={!ok}
          onClick={() => onChange({ kind: 'manual', brand: b.id, brandName: b.id === 'autre' || b.catalogue ? brandName : b.prefix, model, reference })}>
          Continuer
        </Btn>
      </div>
    )
  }

  // ─── 2. Catalogue : familles, recherche, modèles ───
  return (
    <div className="flex flex-col gap-5" data-catalogue={b.id}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {back('Changer de marque', () => setMode('brands'))}
        <span className="text-[0.9375rem] font-semibold">{b.label}</span>
      </div>

      {b.partsNote && (
        <p className="flex items-center gap-2 text-[0.8125rem] font-medium" style={{ color: 'var(--c9-accent-text)' }} data-parts-note>
          <IconCheck className="h-4 w-4" strokeWidth={2.2} /> {b.partsNote}
        </p>
      )}

      <div className="relative flex flex-col gap-1.5">
        <label htmlFor="d-search" className="text-[0.8125rem] font-medium" style={{ color: 'var(--c9-text-2)' }}>{b.searchLabel}</label>
        <span className="pointer-events-none absolute bottom-0 left-4 flex h-[56px] items-center" style={{ color: 'var(--c9-text-3)' }}>
          <IconSearch className="h-5 w-5" />
        </span>
        <input id="d-search" type="search" className={`${inputCls} pl-12`} style={inputStyle} value={query} autoComplete="off"
          placeholder={b.id === 'samsung' ? 'Ex. A55, S23, S24 Ultra' : 'Ex. 13 Pro, 15'}
          onChange={(e) => setQuery(e.target.value)} />
      </div>

      {query.trim() ? (
        results.length ? (
          <Choice name="Résultats" columns={2} minWidth="9rem" size="sm" value={selectedId} onChange={pick}
            options={results.map((m) => ({ id: m.id, label: m.name }))} />
        ) : (
          <p style={{ color: 'var(--c9-text-2)' }}>Aucun modèle trouvé pour « {query.trim()} ».</p>
        )
      ) : (
        <>
          <Choice name="Gamme" columns={Math.min(3, b.families.length)} minWidth="6.5rem" size="sm" value={family}
            onChange={setFamily}
            options={b.families.map((f) => ({ id: f.id, label: f.label }))} />
          {family && (
            <Choice name={b.families.find((f) => f.id === family)?.label ?? 'Modèles'} columns={2} minWidth="9rem" size="sm"
              value={selectedId} onChange={pick}
              options={familyModels.map((m) => ({ id: m.id, label: m.name }))} />
          )}
        </>
      )}

      <button type="button" onClick={notFound} data-not-found
        className="self-start rounded-lg text-[0.9375rem] font-medium underline underline-offset-4"
        style={{ color: 'var(--c9-accent-text)', minHeight: 44 }}>
        Je ne trouve pas mon modèle
      </button>
    </div>
  )
}
