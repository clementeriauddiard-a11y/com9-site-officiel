'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { WaCta, WaIcon } from '@/components/ui/Wa'
import { waLink } from '@/lib/links'
import { scrollToElement } from '@/lib/scroll'

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

// ─── Barre de prix — toujours sous les yeux, la page ne bouge jamais ─────────
//
//  Principe : c'est le prix qui vient à l'utilisateur, pas l'inverse.
//  On peut enchaîner les modèles et les prestations sans jamais perdre sa
//  place dans la liste. Le seul déplacement possible est explicite : le
//  bouton de droite.
//
// ─────────────────────────────────────────────────────────────────────────────

function PriceBar({
  model,
  repair,
  options,
  onDetail,
}: {
  model: string
  repair: RepairId
  options: PriceOption[]
  onDetail: () => void
}) {
  const repairLabel = REPAIRS.find((r) => r.id === repair)?.label ?? ''
  const single = options.length === 1 ? options[0] : null

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
        // Barre d'accueil iPhone / barre de navigation Android
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3 sm:px-8">
        {/* Récapitulatif */}
        <div className="min-w-0 flex-1">
          <p
            className="mb-1 truncate font-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--c9-text-3)' }}
          >
            {model} · {repairLabel}
          </p>

          {single ? (
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-space text-[1.375rem] font-semibold leading-none"
                style={{ color: 'var(--c9-text)', letterSpacing: '-0.03em' }}
              >
                {single.price} €
              </span>
              <span
                className="truncate font-space text-[0.75rem] leading-none"
                style={{ color: 'var(--c9-text-3)' }}
              >
                {single.label}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              {options.map((o) => (
                <span key={o.id} className="flex items-baseline gap-1 leading-none">
                  <span
                    className="font-space text-[1.125rem] font-semibold"
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

        {/* Action — contextuelle : réserver s'il n'y a qu'une offre,
            aller choisir s'il y en a deux. */}
        {single ? (
          <a
            href={waLink(single.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="c9-back flex shrink-0 items-center justify-center gap-2 rounded-full px-5 font-space text-[0.875rem] font-semibold"
            style={{
              minHeight: '48px',
              background: 'linear-gradient(118deg, #6fe6ff 0%, #3ad9ff 42%, #1aa9ff 100%)',
              color: '#06131f',
              boxShadow: '0 12px 32px -18px rgba(26,169,255,0.9)',
            }}
          >
            <WaIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Rendez-vous</span>
            <span className="xs:hidden">RDV</span>
          </a>
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
            Choisir
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M3.5 6L8 10.5 12.5 6" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [repair, setRepair] = useState<RepairId>('ecran')
  const [model, setModel] = useState<string | null>(null)

  // Bloc « 03 · Tarif » — cible du bouton « Détail » de la barre.
  const resultRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // La barre de prix n'existe que tant qu'on est dans la section Tarifs :
  // elle ne doit pas flotter au-dessus de la Marketplace ou du Diagnostic.
  const [inSection, setInSection] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInSection(entry.isIntersecting),
      // -10% en bas : la barre s'efface juste avant de quitter la section.
      { rootMargin: '-80px 0px -10% 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
    // Aucun défilement : le prix est déjà sous les yeux, dans la barre.
  }

  // La barre n'apparaît qu'avec un tarif réel et tant qu'on est dans la section.
  const showBar = inSection && !!current && options.length > 0

  function handleModel(next: string) {
    // Un appui = un prix mis à jour. La page, elle, ne bouge jamais :
    // l'utilisateur reste libre de comparer modèles et prestations.
    setModel(next)
  }

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
          <ModelPicker models={models} value={model} onChange={handleModel} />
        </motion.div>

        {/* ── Étape 3 ── */}
        <motion.div
          ref={resultRef}
          className="c9-scroll-target"
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

        {/* Réserve la place de la barre pour ne rien masquer en bas de section */}
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
            onDetail={() => scrollToElement(resultRef.current, 88)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
