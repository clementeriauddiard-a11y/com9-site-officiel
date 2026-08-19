'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  MODELS,
  REPAIRS,
  buildRepairMessage,
  getOptions,
  priceFrom,
  type ModelTarif,
  type PriceOption,
  type RepairId,
} from '@/data/tarifs'
import { WaCta } from '@/components/ui/Wa'
import { waLink } from '@/lib/links'

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Sur-titre d'étape ───────────────────────────────────────────────────────

function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span
        className="font-mono text-[10px] tracking-[0.28em]"
        style={{ color: 'var(--c9-accent)' }}
      >
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
      style={{
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid var(--c9-hairline-soft)',
      }}
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
  // Regroupement par série, dans l'ordre de la grille officielle.
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
                    background: active
                      ? 'rgba(58,217,255,0.13)'
                      : 'rgba(255,255,255,0.04)',
                    border: active
                      ? '1px solid var(--c9-accent-line)'
                      : '1px solid var(--c9-hairline-soft)',
                    boxShadow: active
                      ? '0 12px 34px -22px rgba(58,217,255,0.9)'
                      : 'none',
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

// ─── Étape 3 — carte d'offre ─────────────────────────────────────────────────

function OptionCard({
  option,
  emphasis,
  index,
  reserveBadge,
}: {
  option: PriceOption
  emphasis: boolean
  index: number
  /** Réserve la hauteur du badge pour aligner les cartes côte à côte */
  reserveBadge: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
      className={`flex flex-col rounded-[26px] p-6 sm:p-7 ${
        emphasis ? 'c9-surface-accent' : 'c9-surface'
      }`}
    >
      {/* Badge — sur sa propre ligne pour ne jamais compresser le libellé.
          Quand une carte voisine porte un badge, on réserve la même hauteur
          afin que les deux titres restent parfaitement alignés. */}
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

      {/* Prix */}
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

      <p
        className="mb-7 font-space text-[0.8125rem] leading-relaxed"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {option.note}
      </p>

      <div className="mt-auto">
        <WaCta
          message={option.waMessage}
          variant={emphasis ? 'primary' : 'secondary'}
        />
      </div>
    </motion.div>
  )
}

// ─── Étape 3 — panneau résultat ──────────────────────────────────────────────

function ResultPanel({
  repair,
  model,
  options,
}: {
  repair: RepairId
  model: string
  options: PriceOption[]
}) {
  const repairLabel = REPAIRS.find((r) => r.id === repair)?.label ?? ''
  const two = options.length === 2

  return (
    <div>
      {/* Récapitulatif */}
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          className="font-space text-[1.375rem] font-semibold leading-tight sm:text-2xl"
          style={{ color: 'var(--c9-text)', letterSpacing: '-0.025em' }}
        >
          {model}
        </h3>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.24em]"
          style={{ color: 'var(--c9-accent)' }}
        >
          {repairLabel}
        </span>
      </div>

      <div className={`grid gap-3.5 ${two ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {options.map((o, i) => (
          <OptionCard
            key={o.id}
            option={o}
            index={i}
            reserveBadge={two && options.some((x) => x.recommended)}
            // Sur écran : l'OLED est mise en avant dès qu'un choix existe.
            // Sur une offre unique : elle porte naturellement l'action principale.
            emphasis={two ? o.recommended : true}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Placeholder — invite calme, pas de vide ─────────────────────────────────

function EmptyHint({ repair }: { repair: RepairId }) {
  const from = priceFrom(repair)
  const label = REPAIRS.find((r) => r.id === repair)?.label.toLowerCase() ?? ''

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[26px] px-6 py-11 text-center"
      style={{
        border: '1px dashed var(--c9-hairline)',
        background: 'rgba(255,255,255,0.018)',
      }}
    >
      <p
        className="font-space text-[0.9375rem] leading-relaxed"
        style={{ color: 'var(--c9-text-2)' }}
      >
        Sélectionnez votre modèle pour afficher le tarif.
      </p>
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--c9-text-3)' }}
      >
        {label} · à partir de {from} €
      </p>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [repair, setRepair] = useState<RepairId>('ecran')
  const [model, setModel] = useState<string | null>(null)

  // Tous les modèles de la grille proposent les trois prestations,
  // mais on filtre malgré tout : aucune offre indisponible n'est affichée.
  const models = useMemo(
    () => MODELS.filter((m) => getOptions(repair, m).length > 0),
    [repair],
  )

  const current = model ? models.find((m) => m.model === model) ?? null : null
  const options = current ? getOptions(repair, current) : []

  function handleRepair(id: RepairId) {
    setRepair(id)
    // On conserve le modèle sélectionné si la nouvelle prestation existe pour lui.
    if (!model) return
    const m = MODELS.find((x) => x.model === model)
    if (!m || getOptions(id, m).length === 0) setModel(null)
  }

  return (
    <section
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
          <p className="section-label mb-5">Tarifs</p>
          <h2 className="c9-title mb-5">
            Un prix clair,
            <br />
            <span className="gradient-text">en trois gestes.</span>
          </h2>
          <p className="c9-subtitle mx-auto max-w-md">
            Choisissez la réparation, puis votre iPhone. Le tarif s&apos;affiche
            immédiatement — sans surprise.
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
                <ResultPanel repair={repair} model={current.model} options={options} />
              ) : (
                <EmptyHint repair={repair} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Mentions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-14"
        >
          <div className="c9-divider mb-7" />

          <div className="flex flex-col items-center gap-4 text-center">
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
      </div>
    </section>
  )
}
