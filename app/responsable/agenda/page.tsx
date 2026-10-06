'use client'

// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda privé
// Accès : /responsable/agenda  (protégé par proxy.ts, comme /responsable)
//
//   • Aujourd'hui  — pensé pour le téléphone
//   • Semaine      — grille horaire pour l'ordinateur
//   • Demandes     — à traiter, séparées du planning
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import BackLink from '@/components/ui/BackLink'
import ApptForm from '@/components/agenda/ApptForm'
import ApptSheet from '@/components/agenda/ApptSheet'
import SettingsPanel from '@/components/agenda/SettingsPanel'
import { DayView, PendingView, WeekView } from '@/components/agenda/Views'
import { ApiError, api, type ApptLite, type Storage } from '@/components/agenda/api'
import { addDays, dayRange, mondayOf, parisToIso, todayParis } from '@/components/agenda/time'
import { Btn, ErrorBox } from '@/components/agenda/ui'
import { DEFAULT_SETTINGS, type AgendaSettings } from '@/lib/agenda/types'

type Tab = 'jour' | 'semaine' | 'demandes'
const TAB_KEY = 'com9-agenda-tab'

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" className="absolute inset-0 cursor-default"
        style={{ background: 'rgba(5,10,20,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-y-auto px-5 sm:max-w-[540px] sm:px-7"
        style={{ background: 'var(--c9-bg)', borderLeft: '1px solid var(--c9-hairline)', paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
        <h2 className="mb-6 font-space text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [tab, setTab] = useState<Tab>('jour')
  const [date, setDate] = useState(todayParis())
  const [monday, setMonday] = useState(mondayOf(todayParis()))

  const [items, setItems] = useState<ApptLite[]>([])
  const [pending, setPending] = useState<ApptLite[]>([])
  const [followups, setFollowups] = useState<{ reminders: ApptLite[]; aftercare: ApptLite[] }>({ reminders: [], aftercare: [] })
  const [settings, setSettings] = useState<AgendaSettings>(DEFAULT_SETTINGS)
  const [storage, setStorage] = useState<Storage>('durable')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Onglet de départ : semaine sur ordinateur, aujourd'hui sur téléphone.
  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem(TAB_KEY) } catch {}
    if (saved === 'jour' || saved === 'semaine' || saved === 'demandes') setTab(saved)
    else setTab(window.innerWidth >= 1024 ? 'semaine' : 'jour')
  }, [])

  function chooseTab(t: Tab) {
    setTab(t)
    try { localStorage.setItem(TAB_KEY, t) } catch {}
  }

  const refresh = useCallback(async () => {
    try {
      const range = tab === 'semaine'
        ? { from: parisToIso(monday, '00:00'), to: parisToIso(addDays(monday, 7), '00:00') }
        : dayRange(date)
      const [r, p, f] = await Promise.all([
        tab === 'demandes' ? Promise.resolve(null) : api.range(range.from, range.to),
        api.pending(),
        api.followups(),
      ])
      if (r) { setItems(r.items); setStorage(r.storage) }
      setPending(p.items)
      setFollowups({ reminders: f.reminders, aftercare: f.aftercare })
      setStorage(p.storage)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [tab, date, monday])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    api.settings().then((s) => setSettings(s.settings)).catch(() => {})
  }, [])

  // Téléphone et ordinateur restent synchronisés : rechargement au retour
  // sur l'onglet, puis toutes les minutes tant que la page est visible.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVis)
    const t = setInterval(() => { if (document.visibilityState === 'visible') refresh() }, 60_000)
    return () => { document.removeEventListener('visibilitychange', onVis); clearInterval(t) }
  }, [refresh])

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'jour', label: "Aujourd'hui" },
    { id: 'semaine', label: 'Semaine' },
    { id: 'demandes', label: pending.length ? `Demandes · ${pending.length}` : 'Demandes' },
  ]

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* ── En-tête ── */}
      <header className="sticky top-0 z-40"
        style={{
          background: 'rgba(17,31,53,0.86)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom: '1px solid var(--c9-hairline-soft)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
          <BackLink href="/responsable" label="Espace responsable" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Réglages du planning" title="Réglages"
              className="c9-back flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--c9-hairline-soft)' }}>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />
              </svg>
            </button>
            <Btn variant="primary" className="hidden md:inline-flex" onClick={() => setCreating(true)}>
              + Nouveau rendez-vous
            </Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-7 md:px-8">
        <h1 className="mb-6 font-space text-[2.25rem] font-bold leading-none" style={{ letterSpacing: '-0.035em' }}>
          Agenda
        </h1>

        {storage === 'memoire' && (
          <div className="mb-5 rounded-2xl px-4 py-3 font-space text-[0.875rem] leading-relaxed"
            style={{ background: 'rgba(245,185,74,0.08)', border: '1px solid rgba(245,185,74,0.4)', color: '#fde3ad' }}>
            Mode test : aucune base de données n&apos;est configurée ici. Les rendez-vous sont gardés en mémoire
            et seront perdus au redémarrage du serveur. En ligne, la base de données du site est utilisée.
          </div>
        )}

        {/* ── Onglets ── */}
        <div role="tablist" aria-label="Vues de l'agenda" className="mb-6 grid grid-cols-3 gap-1.5 rounded-[20px] p-1.5 md:max-w-md"
          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid var(--c9-hairline-soft)' }}>
          {tabs.map((t) => {
            const on = t.id === tab
            return (
              <button key={t.id} role="tab" aria-selected={on} type="button" onClick={() => chooseTab(t.id)}
                className="rounded-2xl px-2 font-space text-[0.875rem] transition-all duration-200"
                style={{
                  minHeight: '46px',
                  background: on ? 'rgba(255,255,255,0.10)' : 'transparent',
                  border: on ? '1px solid var(--c9-hairline-lit)' : '1px solid transparent',
                  color: on ? 'var(--c9-text)' : 'var(--c9-text-3)',
                  fontWeight: on ? 600 : 500,
                }}>
                {t.label}
              </button>
            )
          })}
        </div>

        {error && <div className="mb-5"><ErrorBox message={error} /></div>}

        {!loading && tab !== 'demandes' && (followups.reminders.length + followups.aftercare.length) > 0 && (
          <button type="button" onClick={() => setTab('demandes')}
            className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left font-space text-[0.875rem]"
            style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.35)', color: 'var(--c9-text)' }}>
            <span>
              WhatsApp à envoyer :{' '}
              {followups.reminders.length > 0 && <b>{followups.reminders.length} rappel{followups.reminders.length > 1 ? 's' : ''}</b>}
              {followups.reminders.length > 0 && followups.aftercare.length > 0 && ' · '}
              {followups.aftercare.length > 0 && <b>{followups.aftercare.length} suivi{followups.aftercare.length > 1 ? 's' : ''} après intervention</b>}
            </span>
            <span style={{ color: '#4ade80' }}>Voir</span>
          </button>
        )}

        {loading ? (
          <p className="font-space" style={{ color: 'var(--c9-text-3)' }}>Chargement…</p>
        ) : tab === 'jour' ? (
          <DayView date={date} items={items} onDate={setDate} onOpen={setOpenId} />
        ) : tab === 'semaine' ? (
          <WeekView monday={monday} items={items} settings={settings}
            onWeek={(d) => setMonday(mondayOf(d))} onOpen={setOpenId} />
        ) : (
          <PendingView items={pending} followups={followups} onOpen={setOpenId} />
        )}
      </main>

      {/* ── Nouveau rendez-vous : bouton fixe sur téléphone ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-5 pt-3 md:hidden"
        style={{
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--c9-bg) 65%, transparent)',
        }}>
        <Btn variant="primary" className="w-full" onClick={() => setCreating(true)}>+ Nouveau rendez-vous</Btn>
      </div>

      {toast && (
        <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full px-5 py-2.5 font-space text-[0.875rem] font-medium"
          style={{ background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.45)', color: '#bbf7d0', backdropFilter: 'blur(12px)' }}>
          {toast}
        </div>
      )}

      {creating && (
        <Sheet title="Nouveau rendez-vous" onClose={() => setCreating(false)}>
          <ApptForm
            mode="create"
            settings={settings}
            defaultDate={tab === 'semaine' ? (monday <= todayParis() && todayParis() <= addDays(monday, 6) ? todayParis() : monday) : date}
            onCancel={() => setCreating(false)}
            onSubmit={async (input, status) => {
              const { appt } = await api.create(input, status)
              setCreating(false)
              flash(status === 'confirme' ? 'Rendez-vous enregistré' : 'Demande enregistrée')
              await refresh()
              setOpenId(appt.id)
            }}
          />
        </Sheet>
      )}

      {settingsOpen && (
        <Sheet title="Réglages du planning" onClose={() => setSettingsOpen(false)}>
          <SettingsPanel settings={settings} onClose={() => setSettingsOpen(false)}
            onSaved={(s) => { setSettings(s); setSettingsOpen(false); flash('Réglages enregistrés'); refresh() }} />
        </Sheet>
      )}

      {openId && (
        <ApptSheet id={openId} settings={settings} onClose={() => setOpenId(null)} onChanged={refresh} />
      )}
    </div>
  )
}
