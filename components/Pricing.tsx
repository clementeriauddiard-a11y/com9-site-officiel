'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MODELS,
  PRICE_NOTE,
  REPAIRS,
  TRAVEL_RULE,
  ZONES,
  buildQuote,
  buildQuoteMessage,
  buildRepairMessage,
  findZone,
  getOptions,
  priceFrom,
  type ModelTarif,
  type PriceOption,
  type RepairId,
  type Zone,
  type ZoneId,
} from '@/data/tarifs'
import Link from 'next/link'
import { WaCta } from '@/components/ui/Wa'
import { waLink } from '@/lib/links'
import { scrollToElement } from '@/lib/scroll'

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Sur-titre d'étape ───────────────────────────────────────────────────────

function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-[10px] tracking-[0.28em]" style={{ color: 'var(--c9-accent)' }}>
        {n}
      </span>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.24em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {children}
      </span>
    </div>
  )
}

// ─── Étape 1 — prestation ────────────────────────────────────────────────────

function RepairSwitch({
  value,
  onChange,
}: {
  value: RepairId
  onChange: (id: RepairId) => void
}) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 rounded-[20px] p-1.5"
      role="tablist"
      aria-label="Choix de la prestation"
      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid var(--c9-hairline-soft)' }}
    >
      {REPAIRS.map((r) => {
        const active = r.id === value
        return (
          <button
            key={r.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r.id)}
            className="relative flex items-center justify-center rounded-2xl px-1.5 transition-colors duration-300"
            style={{ minHeight: '54px' }}
          >
            {active && (
              <motion.span
                layoutId="c9-repair-pill"
                className="absolute inset-0 rounded-2xl"
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid var(--c9-hairline-lit)',
                  boxShadow: '0 8px 26px -16px rgba(0,0,0,0.7)',
                }}
              />
            )}
            <span
              className="relative z-10 text-balance px-0.5 text-center font-space text-[0.8125rem] leading-tight transition-colors duration-300 sm:text-[0.9375rem]"
              style={{
                color: active ? 'var(--c9-text)' : 'var(--c9-text-3)',
                fontWeight: active ? 600 : 500,
              }}
            >
              {r.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Étape 2 — modèle ────────────────────────────────────────────────────────

function ModelPicker({
  models,
  value,
  onChange,
}: {
  models: ModelTarif[]
  value: string | null
  onChange: (model: string) => void
}) {
  const groups = useMemo(() => {
    const out: { serie: string; models: ModelTarif[] }[] = []
    for (const m of models) {
      const last = out[out.length - 1]
      if (last && last.serie === m.serie) last.models.push(m)
      else out.push({ serie: m.serie, models: [m] })
    }
    return out
  }, [models])

  return (
    <div className="space-y-7">
      {groups.map((g) => (
        <div key={g.serie}>
          <p
            className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.26em]"
            style={{ color: 'var(--c9-text-3)' }}
          >
            {g.serie}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {g.models.map((m) => {
              const active = m.model === value
              return (
                <button
                  key={m.model}
                  onClick={() => onChange(m.model)}
                  aria-pressed={active}
                  className="flex items-center justify-center rounded-2xl px-2.5 text-center transition-all duration-300"
                  style={{
                    minHeight: '50px',
                    background: active ? 'rgba(58,217,255,0.13)' : 'rgba(255,255,255,0.04)',
                    border: active
                      ? '1px solid var(--c9-accent-line)'
                      : '1px solid var(--c9-hairline-soft)',
                    boxShadow: active ? '0 12px 34px -22px rgba(58,217,255,0.9)' : 'none',
                  }}
                >
                  <span
                    className="font-space text-[0.8125rem] leading-tight sm:text-sm"
                    style={{
                      color: active ? 'var(--c9-text)' : 'var(--c9-text-2)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {m.model}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Étape 3 — carte d'offre, sélectionnable ─────────────────────────────────

function OptionCard({
  option,
  selected,
  selectable,
  reserveBadge,
  index,
  onSelect,
}: {
  option: PriceOption
  selected: boolean
  /** true quand plusieurs qualités coexistent : la carte devient un choix */
  selectable: boolean
  reserveBadge: boolean
  index: number
  onSelect: () => void
}) {
  const emphasis = selected

  const inner = (
    <>
      {(option.recommended || reserveBadge) && (
        <span
          aria-hidden={!option.recommended}
          className="mb-3 inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em]"
          style={{
            color: option.recommended ? 'var(--c9-accent)' : 'transparent',
            background: option.recommended ? 'rgba(58,217,255,0.10)' : 'transparent',
            border: '1px solid transparent',
            borderColor: option.recommended ? 'var(--c9-accent-line)' : 'transparent',
          }}
        >
          Recommandé
        </span>
      )}

      <h4
        className="mb-5 font-space text-[1.0625rem] font-semibold leading-snug"
        style={{ color: 'var(--c9-text)' }}
      >
        {option.label}
      </h4>

      <div className="mb-1.5 flex items-baseline gap-1.5">
        <span
          className="font-space font-semibold leading-none"
          style={{
            color: 'var(--c9-text)',
            fontSize: 'clamp(2.25rem, 8vw, 2.75rem)',
            letterSpacing: '-0.04em',
          }}
        >
          {option.price}
        </span>
        <span
          className="font-space text-xl font-medium leading-none"
          style={{ color: 'var(--c9-text-2)' }}
        >
          €
        </span>
      </div>

      {/* Tant qu'aucune zone n'est choisie, le prix reste celui de la seule réparation */}
      <p
        className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.18em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        Hors déplacement
      </p>

      <p
        className="font-space text-[0.8125rem] leading-relaxed"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {option.note}
      </p>

      {selectable && (
        <div className="mt-6 flex items-center gap-2">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300"
            style={{
              border: selected
                ? '1px solid var(--c9-accent)'
                : '1px solid var(--c9-hairline-lit)',
              background: selected ? 'var(--c9-accent)' : 'transparent',
            }}
          >
            {selected && (
              <svg viewBox="0 0 12 12" fill="none" stroke="#06131f" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                <path d="M2 6.2l2.6 2.6L10 3.4" />
              </svg>
            )}
          </span>
          <span
            className="font-space text-[0.8125rem]"
            style={{ color: selected ? 'var(--c9-text)' : 'var(--c9-text-3)' }}
          >
            {selected ? 'Qualité choisie' : 'Choisir cette qualité'}
          </span>
        </div>
      )}
    </>
  )

  const className = `flex flex-col rounded-[26px] p-6 text-left transition-all duration-300 sm:p-7 ${
    emphasis ? 'c9-surface-accent' : 'c9-surface'
  }`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
    >
      {selectable ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`w-full ${className}`}
        >
          {inner}
        </button>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </motion.div>
  )
}

// ─── Étape 4 — zone de déplacement ───────────────────────────────────────────

function ZonePicker({
  value,
  onChange,
}: {
  value: ZoneId | null
  onChange: (id: ZoneId) => void
}) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      role="group"
      aria-label="Zone de déplacement"
    >
      {ZONES.map((z) => {
        const active = z.id === value
        return (
          <button
            key={z.id}
            onClick={() => onChange(z.id)}
            aria-pressed={active}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2.5 py-3 text-center transition-all duration-300"
            style={{
              minHeight: '68px',
              background: active ? 'rgba(58,217,255,0.13)' : 'rgba(255,255,255,0.04)',
              border: active
                ? '1px solid var(--c9-accent-line)'
                : '1px solid var(--c9-hairline-soft)',
              boxShadow: active ? '0 12px 34px -22px rgba(58,217,255,0.9)' : 'none',
            }}
          >
            <span
              className="font-space text-[0.8125rem] leading-tight"
              style={{
                color: active ? 'var(--c9-text)' : 'var(--c9-text-2)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {z.label}
            </span>
            <span
              className="font-space text-[0.8125rem] font-semibold leading-none"
              style={{ color: active ? 'var(--c9-accent)' : 'var(--c9-text-3)' }}
            >
              {z.fee === null ? 'Sur devis' : `${z.fee} €`}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Récapitulatif chiffré ───────────────────────────────────────────────────

function QuoteRecap({
  repair,
  model,
  option,
  zone,
}: {
  repair: RepairId
  model: string
  option: PriceOption
  zone: Zone | null
}) {
  const q = buildQuote(option, zone)

  const Line = ({
    label,
    value,
    strong = false,
  }: {
    label: string
    value: string
    strong?: boolean
  }) => (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="font-space"
        style={{
          color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)',
          fontSize: strong ? '1rem' : '0.9375rem',
          fontWeight: strong ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
        className="font-space tabular-nums"
        style={{
          color: strong ? 'var(--c9-text)' : 'var(--c9-text-2)',
          fontSize: strong ? '1.5rem' : '0.9375rem',
          fontWeight: strong ? 600 : 500,
          letterSpacing: strong ? '-0.03em' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="c9-surface rounded-[26px] p-6 sm:p-7"
    >
      <p
        className="mb-5 font-mono text-[9.5px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {model} · {option.label}
      </p>

      <div className="space-y-3">
        <Line label="Réparation" value={`${q.repairPrice} €`} />

        {zone === null && (
          <Line label="Déplacement" value="Selon votre zone" />
        )}

        {zone !== null && q.onQuote && (
          <Line label="Déplacement" value="Sur devis" />
        )}

        {zone !== null && q.travelFee !== null && (
          <Line label="Déplacement" value={`${q.travelFee} €`} />
        )}
      </div>

      <div className="c9-divider my-5" />

      {q.total !== null ? (
        <Line label="Total" value={`${q.total} €`} strong />
      ) : (
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-space text-base font-semibold" style={{ color: 'var(--c9-text)' }}>
            Total
          </span>
          <span
            className="text-right font-space text-[0.9375rem]"
            style={{ color: 'var(--c9-text-3)' }}
          >
            {q.onQuote ? 'Sur devis' : 'Choisissez votre zone'}
          </span>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href={bookingHref(repair, model, option, zone)}
          className="flex w-full items-center justify-center rounded-2xl px-5 text-center font-space text-[0.9375rem] font-semibold transition-transform duration-200 active:scale-[0.985]"
          style={{
            minHeight: '54px',
            background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
            color: '#06131f',
            boxShadow: '0 14px 40px -18px rgba(26,169,255,0.75)',
          }}
        >
          {q.onQuote ? 'Demander un devis et un rendez-vous' : 'Demander un rendez-vous'}
        </Link>
        <WaCta
          variant="secondary"
          message={buildQuoteMessage(repair, model, option, zone)}
          label="Écrire sur WhatsApp"
        />
      </div>

      <p
        className="mt-4 text-center font-space text-[0.75rem] leading-relaxed"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {TRAVEL_RULE}
      </p>
    </motion.div>
  )
}

/** Lien vers la demande de rendez-vous, pré-remplie avec le choix du client. */
function bookingHref(repair: RepairId, model: string, option: PriceOption, zone: Zone | null): string {
  const p = new URLSearchParams({ model, repair, quality: option.label })
  if (zone) p.set('zone', zone.id)
  return `/reservation?${p.toString()}`
}

// ─── Barre de prix — toujours sous les yeux, la page ne bouge jamais ─────────

function PriceBar({
  model,
  repair,
  options,
  selected,
  zone,
  onDetail,
}: {
  model: string
  repair: RepairId
  options: PriceOption[]
  selected: PriceOption | null
  zone: Zone | null
  onDetail: () => void
}) {
  const repairLabel = REPAIRS.find((r) => r.id === repair)?.label ?? ''
  const q = selected ? buildQuote(selected, zone) : null

  return (
    <motion.div
      initial={{ y: '110%' }}
      animate={{ y: 0 }}
      exit={{ y: '110%' }}
      transition={{ duration: 0.34, ease: EASE }}
      className="fixed inset-x-0 bottom-0 z-40"
      style={{
        background: 'rgba(17,31,53,0.82)',
        backdropFilter: 'blur(28px) saturate(150%)',
        WebkitBackdropFilter: 'blur(28px) saturate(150%)',
        borderTop: '1px solid var(--c9-hairline)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3 sm:px-8">
        <div className="min-w-0 flex-1">
          <p
            className="mb-1 truncate font-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--c9-text-3)' }}
          >
            {model} · {repairLabel}
          </p>

          {q && selected ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <span
                className="shrink-0 whitespace-nowrap font-space text-[1.375rem] font-semibold leading-none tabular-nums"
                style={{ color: 'var(--c9-text)', letterSpacing: '-0.03em' }}
              >
                {q.total !== null ? `${q.total} €` : `${q.repairPrice} €`}
              </span>
              {/* Mention courte : le détail chiffré vit dans le récapitulatif */}
              <span
                className="min-w-0 truncate font-mono text-[9px] uppercase leading-none tracking-[0.14em]"
                style={{ color: 'var(--c9-text-3)' }}
              >
                {q.total !== null
                  ? 'déplacement inclus'
                  : q.onQuote
                    ? 'déplacement sur devis'
                    : 'hors déplacement'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              {options.map((o) => (
                <span key={o.id} className="flex items-baseline gap-1 leading-none">
                  <span
                    className="font-space text-[1.125rem] font-semibold tabular-nums"
                    style={{
                      color: o.recommended ? 'var(--c9-accent)' : 'var(--c9-text)',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {o.price} €
                  </span>
                  <span
                    className="font-mono text-[8.5px] uppercase tracking-[0.14em]"
                    style={{ color: 'var(--c9-text-3)' }}
                  >
                    {o.id === 'lcd' ? 'LCD' : 'OLED'}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Une offre prête et une zone chiffrée → demande de rendez-vous pré-remplie.
            Sinon on renvoie vers le détail pour compléter le choix. */}
        {q && selected && q.total !== null ? (
          <Link
            href={bookingHref(repair, model, selected, zone)}
            className="c9-back flex shrink-0 items-center justify-center gap-2 rounded-full px-5 font-space text-[0.875rem] font-semibold"
            style={{
              minHeight: '48px',
              background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
              color: '#06131f',
              boxShadow: '0 12px 32px -18px rgba(26,169,255,0.9)',
            }}
          >
            <span className="hidden xs:inline">Rendez-vous</span>
            <span className="xs:hidden">RDV</span>
          </Link>
        ) : (
          <button
            onClick={onDetail}
            className="c9-back flex shrink-0 items-center justify-center gap-2 rounded-full px-5 font-space text-[0.875rem] font-semibold"
            style={{
              minHeight: '48px',
              border: '1px solid var(--c9-hairline-lit)',
              background: 'rgba(255,255,255,0.07)',
              color: 'var(--c9-text)',
            }}
          >
            {selected ? 'Ma zone' : 'Choisir'}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M3.5 6L8 10.5 12.5 6" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Invite calme avant sélection ────────────────────────────────────────────

function EmptyHint({ repair }: { repair: RepairId }) {
  const from = priceFrom(repair)
  const label = REPAIRS.find((r) => r.id === repair)?.label.toLowerCase() ?? ''

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[26px] px-6 py-11 text-center"
      style={{ border: '1px dashed var(--c9-hairline)', background: 'rgba(255,255,255,0.018)' }}
    >
      <p className="font-space text-[0.9375rem] leading-relaxed" style={{ color: 'var(--c9-text-2)' }}>
        Sélectionnez votre modèle pour afficher le tarif.
      </p>
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {label} · à partir de {from} € hors déplacement
      </p>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [repair, setRepair] = useState<RepairId>('ecran')
  const [model, setModel] = useState<string | null>(null)
  const [optionId, setOptionId] = useState<string | null>(null)
  const [zoneId, setZoneId] = useState<ZoneId | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const [inSection, setInSection] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInSection(entry.isIntersecting),
      { rootMargin: '-80px 0px -10% 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const models = useMemo(
    () => MODELS.filter((m) => getOptions(repair, m).length > 0),
    [repair],
  )

  const current = model ? models.find((m) => m.model === model) ?? null : null
  const options = current ? getOptions(repair, current) : []

  // Une seule qualité proposée → elle est retenue d'office.
  // Plusieurs qualités → aucune présélection, le client choisit.
  useEffect(() => {
    if (options.length === 1) setOptionId(options[0].id)
    else setOptionId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, repair, options.length])

  const selected = options.find((o) => o.id === optionId) ?? null
  const zone = findZone(zoneId)

  function handleRepair(id: RepairId) {
    setRepair(id)
    if (!model) return
    const m = MODELS.find((x) => x.model === model)
    if (!m || getOptions(id, m).length === 0) setModel(null)
  }

  const showBar = inSection && !!current && options.length > 0

  return (
    <section
      ref={sectionRef}
      id="tarifs"
      className="relative"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        {/* ── En-tête ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 text-center sm:mb-16"
        >
          <h2 className="c9-title mb-4">Tarifs</h2>
          <p className="c9-subtitle mx-auto max-w-sm">
            Votre réparation, votre modèle, votre prix.
          </p>
        </motion.div>

        {/* ── Étape 1 ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-12"
        >
          <StepLabel n="01">Prestation</StepLabel>
          <RepairSwitch value={repair} onChange={handleRepair} />
        </motion.div>

        {/* ── Étape 2 ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          className="mb-12"
        >
          <StepLabel n="02">Votre iPhone</StepLabel>
          <ModelPicker models={models} value={model} onChange={setModel} />
        </motion.div>

        {/* ── Étape 3 ── */}
        <motion.div
          ref={resultRef}
          className="c9-scroll-target mb-12"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          <StepLabel n="03">Tarif</StepLabel>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${repair}-${model ?? 'none'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {current && options.length > 0 ? (
                <>
                  <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3
                      className="font-space text-[1.375rem] font-semibold leading-tight sm:text-2xl"
                      style={{ color: 'var(--c9-text)', letterSpacing: '-0.025em' }}
                    >
                      {current.model}
                    </h3>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.24em]"
                      style={{ color: 'var(--c9-accent)' }}
                    >
                      {REPAIRS.find((r) => r.id === repair)?.label}
                    </span>
                  </div>

                  <div
                    className={`grid gap-3.5 ${
                      options.length === 2 ? 'sm:grid-cols-2' : 'sm:max-w-sm'
                    }`}
                  >
                    {options.map((o, i) => (
                      <OptionCard
                        key={o.id}
                        option={o}
                        index={i}
                        selected={optionId === o.id}
                        selectable={options.length > 1}
                        reserveBadge={options.length === 2 && options.some((x) => x.recommended)}
                        onSelect={() => setOptionId(o.id)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyHint repair={repair} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Étape 4 — déplacement ── */}
        <motion.div
          ref={zoneRef}
          className="c9-scroll-target mb-12"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
        >
          <StepLabel n="04">Déplacement</StepLabel>
          <ZonePicker value={zoneId} onChange={setZoneId} />

          {current && options.length > 1 && !selected && (
            <p
              className="mt-4 text-center font-space text-[0.8125rem]"
              style={{ color: 'var(--c9-text-3)' }}
            >
              Choisissez une qualité d&apos;écran pour afficher le total.
            </p>
          )}

          {current && selected && (
            <div className="mt-5">
              <QuoteRecap
                repair={repair}
                model={current.model}
                option={selected}
                zone={zone}
              />
            </div>
          )}
        </motion.div>

        {/* ── Mentions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="c9-divider mb-7" />

          <div className="flex flex-col items-center gap-4 text-center">
            <p
              className="max-w-sm font-space text-[0.8125rem] leading-relaxed"
              style={{ color: 'var(--c9-text-2)' }}
            >
              {PRICE_NOTE}
            </p>

            <div
              className="flex flex-col items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--c9-text-3)' }}
            >
              <p>Garantie pièces &amp; main d&apos;œuvre</p>
              <p>CB · Espèces · Virement</p>
            </div>

            <a
              href={waLink(buildRepairMessage('ecran'))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 font-space text-sm underline-offset-4 transition-colors duration-300 hover:underline"
              style={{ color: 'var(--c9-accent)', minHeight: '44px' }}
            >
              Votre modèle n&apos;est pas listé ? Écrivez-nous
            </a>
          </div>
        </motion.div>

        {showBar && <div aria-hidden style={{ height: '84px' }} />}
      </div>

      {/* ── Barre de prix ── */}
      <AnimatePresence>
        {showBar && current && (
          <PriceBar
            key="c9-price-bar"
            model={current.model}
            repair={repair}
            options={options}
            selected={selected}
            zone={zone}
            onDetail={() =>
              scrollToElement(selected ? zoneRef.current : resultRef.current, 88)
            }
          />
        )}
      </AnimatePresence>
    </section>
  )
}
