// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : appels à l'API (côté navigateur)
// ─────────────────────────────────────────────────────────────────────────────

import type { ActionId, ApptInput } from '@/lib/agenda/logic'
import type { AgendaSettings, ApptEvent, Appointment } from '@/lib/agenda/types'

export type ApptLite = Omit<Appointment, 'trackToken'>

export type ConflictInfo = { id: string; clientName: string; startAt: string; durationMin: number }

/** Erreur lisible, avec le détail renvoyé par le serveur. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: string[] = [],
    public conflicts: ConflictInfo[] = [],
  ) {
    super(message)
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      credentials: 'same-origin',
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('Connexion impossible. Vérifiez le réseau puis réessayez.', 0)
  }

  if (res.status === 401) {
    // Session expirée : retour à la connexion, puis retour ici.
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`
    throw new ApiError('Session expirée.', 401)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(body.error ?? 'Erreur inattendue.', res.status, body.errors ?? [], body.conflicts ?? [])
  }
  return body as T
}

export type Storage = 'durable' | 'memoire'

export const api = {
  range: (from: string, to: string) =>
    call<{ items: ApptLite[]; storage: Storage }>(
      `/api/agenda?view=range&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  pending: () => call<{ items: ApptLite[]; storage: Storage }>('/api/agenda?view=pending'),

  detail: (id: string) => call<{ appt: Appointment; events: ApptEvent[] }>(`/api/agenda/${id}`),

  create: (input: ApptInput, status: 'demande_recue' | 'confirme') =>
    call<{ appt: Appointment }>('/api/agenda', { method: 'POST', body: JSON.stringify({ input, status }) }),

  update: (id: string, patch: Partial<ApptInput>) =>
    call<{ appt: Appointment }>(`/api/agenda/${id}`, { method: 'PATCH', body: JSON.stringify({ patch }) }),

  action: (id: string, action: ActionId, payload?: { proposedStartAt?: string; reason?: string; firm?: boolean }) =>
    call<{ appt: Appointment }>(`/api/agenda/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action, payload: payload ?? {} }),
    }),

  settings: () => call<{ settings: AgendaSettings; storage: Storage }>('/api/agenda/settings'),

  saveSettings: (settings: AgendaSettings) =>
    call<{ settings: AgendaSettings }>('/api/agenda/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
}
