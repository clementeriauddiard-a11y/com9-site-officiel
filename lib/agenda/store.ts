// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Agenda : stockage durable
// ─────────────────────────────────────────────────────────────────────────────
//
//  Production : la base Neon (Vercel Postgres) déjà utilisée par la
//  Marketplace, via POSTGRES_URL. Les tables sont créées automatiquement au
//  premier appel, comme pour `phones`.
//
//  ⚠️  Contrairement à la Marketplace, l'agenda REFUSE de fonctionner en
//  production sans base de données : un stockage en mémoire perdrait les
//  rendez-vous à chaque redémarrage, sans prévenir. La mémoire n'est autorisée
//  qu'en développement local, ou explicitement pour des tests.
//
//  Ce fichier ne prend aucune décision métier : il enregistre et relit.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  DEFAULT_SETTINGS,
  PENDING_STATUSES,
  type AgendaSettings,
  type ApptEvent,
  type Appointment,
} from './types'

// ─── Pilote SQL ──────────────────────────────────────────────────────────────

/** Interface minimale commune à @vercel/postgres et à node-postgres. */
export type SqlDriver = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }>
}

let injected: SqlDriver | null = null

/** Réservé aux tests : remplace la connexion Neon par une autre base. */
export function setSqlDriverForTests(d: SqlDriver | null) {
  injected = d
  tablesReady = null
}

export class StoreUnavailableError extends Error {
  constructor() {
    super("La base de données de l'agenda n'est pas configurée (POSTGRES_URL manquante).")
    this.name = 'StoreUnavailableError'
  }
}

type Mode = 'db' | 'memory'

function resolveMode(): Mode {
  if (injected) return 'db'
  if (process.env.POSTGRES_URL) return 'db'
  if (process.env.NODE_ENV !== 'production') return 'memory'
  if (process.env.AGENDA_ALLOW_MEMORY === '1') return 'memory'
  throw new StoreUnavailableError()
}

async function driver(): Promise<SqlDriver> {
  if (injected) return injected
  const { sql } = await import('@vercel/postgres')
  return sql as unknown as SqlDriver
}

/** Indique au client si les données survivent à un redémarrage. */
export function storageKind(): 'durable' | 'memoire' {
  return resolveMode() === 'db' ? 'durable' : 'memoire'
}

// ─── Schéma ──────────────────────────────────────────────────────────────────

let tablesReady: Promise<void> | null = null

/*
 * Création du schéma — sûre en cas d'appels simultanés.
 *
 * `CREATE TABLE IF NOT EXISTS` n'est PAS sûr quand deux connexions l'exécutent
 * au même instant (Postgres lève « duplicate key » sur son catalogue). Sur
 * Vercel, plusieurs fonctions peuvent démarrer en même temps sur une base
 * neuve. On sérialise donc la création par un verrou consultatif Postgres,
 * dans un seul bloc transactionnel : le verrou couvre tous les processus.
 */
const DDL = [
  `CREATE TABLE IF NOT EXISTS rdv_appointments (
     id                TEXT        PRIMARY KEY,
     track_token       TEXT        NOT NULL UNIQUE,
     created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     client_name       TEXT        NOT NULL,
     client_phone      TEXT        NOT NULL,
     address           TEXT        NOT NULL,
     model             TEXT        NOT NULL,
     repair            TEXT        NOT NULL CHECK (repair IN ('ecran','batterie','vitre')),
     quality           TEXT        NOT NULL,
     description       TEXT        NOT NULL DEFAULT '',
     repair_price      INTEGER     NOT NULL CHECK (repair_price >= 0),
     zone              TEXT        CHECK (zone IS NULL OR zone IN ('z5','z15','z30','devis')),
     zone_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
     travel_fee        INTEGER     CHECK (travel_fee IS NULL OR travel_fee >= 0),
     start_at          TIMESTAMPTZ,
     duration_min      INTEGER     NOT NULL CHECK (duration_min BETWEEN 10 AND 600),
     proposed_start_at TIMESTAMPTZ,
     proposed_reason   TEXT        NOT NULL DEFAULT '',
     proposal_firm     BOOLEAN     NOT NULL DEFAULT FALSE,
     origin            TEXT        NOT NULL CHECK (origin IN ('site','telephone','whatsapp')),
     status            TEXT        NOT NULL CHECK (status IN
                         ('demande_recue','creneau_propose','confirme','en_route','en_cours','termine','annule')),
     part_status       TEXT        CHECK (part_status IS NULL OR part_status IN
                         ('en_stock','a_commander','commandee','recue','indisponible')),
     internal_notes    TEXT        NOT NULL DEFAULT '',
     preferred_date    DATE,
     preferred_period  TEXT        CHECK (preferred_period IS NULL OR preferred_period IN
                         ('matin','apres_midi','fin_journee')),
     availability_note TEXT        NOT NULL DEFAULT ''
   )`,
  // Bases créées par l'étape 1 : ajout des colonnes du souhait client.
  `ALTER TABLE rdv_appointments ADD COLUMN IF NOT EXISTS preferred_date DATE`,
  `ALTER TABLE rdv_appointments ADD COLUMN IF NOT EXISTS preferred_period TEXT
     CHECK (preferred_period IS NULL OR preferred_period IN ('matin','apres_midi','fin_journee'))`,
  `ALTER TABLE rdv_appointments ADD COLUMN IF NOT EXISTS availability_note TEXT NOT NULL DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS rdv_appointments_start_idx  ON rdv_appointments (start_at)`,
  `CREATE INDEX IF NOT EXISTS rdv_appointments_status_idx ON rdv_appointments (status)`,
  `CREATE TABLE IF NOT EXISTS rdv_events (
     id       BIGSERIAL   PRIMARY KEY,
     appt_id  TEXT        NOT NULL REFERENCES rdv_appointments(id) ON DELETE CASCADE,
     at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     kind     TEXT        NOT NULL,
     summary  TEXT        NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS rdv_events_appt_idx ON rdv_events (appt_id, at)`,
  // Journal anonyme des demandes publiques (limitation des envois abusifs).
  // Seule une empreinte non réversible de l'adresse IP est conservée, 48 h maximum.
  `CREATE TABLE IF NOT EXISTS rdv_request_log (
     id       BIGSERIAL   PRIMARY KEY,
     ip_hash  TEXT        NOT NULL,
     at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE INDEX IF NOT EXISTS rdv_request_log_idx ON rdv_request_log (ip_hash, at)`,
  `CREATE TABLE IF NOT EXISTS rdv_settings (
     id    INTEGER PRIMARY KEY CHECK (id = 1),
     data  JSONB   NOT NULL
   )`,
]

const SCHEMA_LOCK_KEY = 0x0c09_a6e0 // identifiant arbitraire, propre à l'agenda

function ensureTables(db: SqlDriver): Promise<void> {
  // Un seul démarrage en cours par processus, partagé par tous les appels.
  if (!tablesReady) {
    const block =
      `DO $$ BEGIN\n` +
      `  PERFORM pg_advisory_xact_lock(${SCHEMA_LOCK_KEY});\n` +
      DDL.map((stmt) => `  ${stmt};`).join('\n') +
      `\nEND $$`
    tablesReady = db.query(block).then(
      () => undefined,
      (err) => {
        tablesReady = null // nouvel essai au prochain appel
        throw err
      },
    )
  }
  return tablesReady
}

// ─── Conversion ligne SQL ⇄ objet ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iso = (v: any): string | null =>
  v === null || v === undefined ? null : (v instanceof Date ? v : new Date(v)).toISOString()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAppt(r: any): Appointment {
  return {
    id: String(r.id),
    trackToken: String(r.track_token),
    createdAt: iso(r.created_at) as string,
    updatedAt: iso(r.updated_at) as string,
    clientName: String(r.client_name),
    clientPhone: String(r.client_phone),
    address: String(r.address),
    model: String(r.model),
    repair: r.repair,
    quality: String(r.quality),
    description: String(r.description ?? ''),
    repairPrice: Number(r.repair_price),
    zone: r.zone ?? null,
    zoneVerified: Boolean(r.zone_verified),
    travelFee: r.travel_fee === null || r.travel_fee === undefined ? null : Number(r.travel_fee),
    startAt: iso(r.start_at),
    durationMin: Number(r.duration_min),
    proposedStartAt: iso(r.proposed_start_at),
    proposedReason: String(r.proposed_reason ?? ''),
    proposalFirm: Boolean(r.proposal_firm),
    origin: r.origin,
    status: r.status,
    partStatus: r.part_status ?? null,
    internalNotes: String(r.internal_notes ?? ''),
    preferredDate: r.preferred_date
      ? (r.preferred_date instanceof Date
          ? dateOnly(r.preferred_date)
          : String(r.preferred_date).slice(0, 10))
      : null,
    preferredPeriod: r.preferred_period ?? null,
    availabilityNote: String(r.availability_note ?? ''),
  }
}

/** Une colonne DATE lue par le pilote devient un Date à minuit UTC : on garde le jour. */
function dateOnly(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const COLS = `id, track_token, created_at, updated_at, client_name, client_phone, address,
  model, repair, quality, description, repair_price, zone, zone_verified, travel_fee,
  start_at, duration_min, proposed_start_at, proposed_reason, proposal_firm,
  origin, status, part_status, internal_notes, preferred_date, preferred_period, availability_note`

// ─── Mémoire (développement local uniquement) ────────────────────────────────

const mem = {
  requests: [] as { ipHash: string; at: number }[],
  appts: [] as Appointment[],
  events: [] as ApptEvent[],
  settings: null as AgendaSettings | null,
  seq: 0,
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

// ─── API du stockage ─────────────────────────────────────────────────────────

export async function insertAppt(a: Appointment): Promise<void> {
  if (resolveMode() === 'memory') {
    mem.appts.push(clone(a))
    return
  }
  const db = await driver()
  await ensureTables(db)
  await db.query(
    `INSERT INTO rdv_appointments (${COLS}) VALUES
     ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
    [
      a.id, a.trackToken, a.createdAt, a.updatedAt, a.clientName, a.clientPhone, a.address,
      a.model, a.repair, a.quality, a.description, a.repairPrice, a.zone, a.zoneVerified,
      a.travelFee, a.startAt, a.durationMin, a.proposedStartAt, a.proposedReason,
      a.proposalFirm, a.origin, a.status, a.partStatus, a.internalNotes,
      a.preferredDate, a.preferredPeriod, a.availabilityNote,
    ],
  )
}

export async function updateAppt(a: Appointment): Promise<void> {
  if (resolveMode() === 'memory') {
    mem.appts = mem.appts.map((x) => (x.id === a.id ? clone(a) : x))
    return
  }
  const db = await driver()
  await ensureTables(db)
  await db.query(
    `UPDATE rdv_appointments SET
       updated_at=$2, client_name=$3, client_phone=$4, address=$5, model=$6, repair=$7,
       quality=$8, description=$9, repair_price=$10, zone=$11, zone_verified=$12,
       travel_fee=$13, start_at=$14, duration_min=$15, proposed_start_at=$16,
       proposed_reason=$17, proposal_firm=$18, origin=$19, status=$20, part_status=$21,
       internal_notes=$22, preferred_date=$23, preferred_period=$24, availability_note=$25
     WHERE id=$1`,
    [
      a.id, a.updatedAt, a.clientName, a.clientPhone, a.address, a.model, a.repair,
      a.quality, a.description, a.repairPrice, a.zone, a.zoneVerified, a.travelFee,
      a.startAt, a.durationMin, a.proposedStartAt, a.proposedReason, a.proposalFirm,
      a.origin, a.status, a.partStatus, a.internalNotes,
      a.preferredDate, a.preferredPeriod, a.availabilityNote,
    ],
  )
}

export async function getAppt(id: string): Promise<Appointment | null> {
  if (resolveMode() === 'memory') {
    const f = mem.appts.find((x) => x.id === id)
    return f ? clone(f) : null
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(`SELECT ${COLS} FROM rdv_appointments WHERE id=$1`, [id])
  return rows[0] ? rowToAppt(rows[0]) : null
}

export async function getApptByToken(token: string): Promise<Appointment | null> {
  if (resolveMode() === 'memory') {
    const f = mem.appts.find((x) => x.trackToken === token)
    return f ? clone(f) : null
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(`SELECT ${COLS} FROM rdv_appointments WHERE track_token=$1`, [token])
  return rows[0] ? rowToAppt(rows[0]) : null
}

/** Rendez-vous dont le créneau (fixé ou proposé) tombe dans [from, to[. */
export async function listRange(fromIso: string, toIso: string): Promise<Appointment[]> {
  if (resolveMode() === 'memory') {
    const f = new Date(fromIso).getTime()
    const t = new Date(toIso).getTime()
    const inR = (v: string | null) => v !== null && new Date(v).getTime() >= f && new Date(v).getTime() < t
    return clone(
      mem.appts
        .filter((a) => inR(a.startAt) || inR(a.proposedStartAt))
        .sort((a, b) => (a.startAt ?? a.proposedStartAt ?? '').localeCompare(b.startAt ?? b.proposedStartAt ?? '')),
    )
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(
    `SELECT ${COLS} FROM rdv_appointments
     WHERE (start_at >= $1 AND start_at < $2)
        OR (proposed_start_at >= $1 AND proposed_start_at < $2)
     ORDER BY COALESCE(start_at, proposed_start_at) ASC`,
    [fromIso, toIso],
  )
  return rows.map(rowToAppt)
}

/** Demandes à traiter : reçues ou en attente de réponse à une proposition. */
export async function listPending(): Promise<Appointment[]> {
  if (resolveMode() === 'memory') {
    return clone(
      mem.appts
        .filter((a) => PENDING_STATUSES.includes(a.status))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    )
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(
    `SELECT ${COLS} FROM rdv_appointments WHERE status = ANY($1) ORDER BY created_at ASC`,
    [PENDING_STATUSES as unknown as string[]],
  )
  return rows.map(rowToAppt)
}

/**
 * Rendez-vous qui bloquent le planning autour d'une date. La fenêtre est
 * élargie d'une journée de chaque côté pour couvrir toute durée et marge.
 */
export async function listBlockingAround(centerIso: string): Promise<Appointment[]> {
  const c = new Date(centerIso).getTime()
  const from = new Date(c - 24 * 3600_000).toISOString()
  const to = new Date(c + 24 * 3600_000).toISOString()
  if (resolveMode() === 'memory') {
    return clone(
      mem.appts.filter(
        (a) =>
          ['confirme', 'en_route', 'en_cours'].includes(a.status) &&
          a.startAt !== null &&
          a.startAt >= from &&
          a.startAt < to,
      ),
    )
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(
    `SELECT ${COLS} FROM rdv_appointments
     WHERE status IN ('confirme','en_route','en_cours')
       AND start_at >= $1 AND start_at < $2`,
    [from, to],
  )
  return rows.map(rowToAppt)
}

// ─── Historique ──────────────────────────────────────────────────────────────

export async function addEvent(apptId: string, kind: ApptEvent['kind'], summary: string): Promise<void> {
  if (resolveMode() === 'memory') {
    mem.events.push({ id: ++mem.seq, apptId, at: new Date().toISOString(), kind, summary })
    return
  }
  const db = await driver()
  await ensureTables(db)
  await db.query(`INSERT INTO rdv_events (appt_id, kind, summary) VALUES ($1,$2,$3)`, [apptId, kind, summary])
}

export async function listEvents(apptId: string): Promise<ApptEvent[]> {
  if (resolveMode() === 'memory') {
    return clone(mem.events.filter((e) => e.apptId === apptId))
  }
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(
    `SELECT id, appt_id, at, kind, summary FROM rdv_events WHERE appt_id=$1 ORDER BY at ASC, id ASC`,
    [apptId],
  )
  return rows.map((r) => ({
    id: Number(r.id),
    apptId: String(r.appt_id),
    at: iso(r.at) as string,
    kind: r.kind,
    summary: String(r.summary),
  }))
}

// ─── Réglages ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AgendaSettings> {
  if (resolveMode() === 'memory') return clone(mem.settings ?? DEFAULT_SETTINGS)
  const db = await driver()
  await ensureTables(db)
  const { rows } = await db.query(`SELECT data FROM rdv_settings WHERE id=1`)
  if (!rows[0]) return clone(DEFAULT_SETTINGS)
  const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data
  // Fusion avec les valeurs par défaut : un réglage ajouté plus tard reste défini.
  return { ...DEFAULT_SETTINGS, ...data, durations: { ...DEFAULT_SETTINGS.durations, ...(data.durations ?? {}) } }
}

export async function saveSettings(s: AgendaSettings): Promise<void> {
  if (resolveMode() === 'memory') {
    mem.settings = clone(s)
    return
  }
  const db = await driver()
  await ensureTables(db)
  await db.query(
    `INSERT INTO rdv_settings (id, data) VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [JSON.stringify(s)],
  )
}

// ─── Journal des demandes publiques (anti-abus) ──────────────────────────────

export type RequestCounts = { sameSourceShort: number; sameSourceDay: number; allDay: number }

/**
 * Compte les demandes récentes, puis enregistre la nouvelle tentative.
 * shortMin : fenêtre courte (minutes) pour une même source.
 */
export async function countAndLogRequest(ipHash: string, shortMin: number): Promise<RequestCounts> {
  const now = Date.now()
  const shortSince = now - shortMin * 60_000
  const daySince = now - 24 * 3_600_000
  if (resolveMode() === 'memory') {
    mem.requests = mem.requests.filter((r) => r.at >= now - 48 * 3_600_000)
    const counts = {
      sameSourceShort: mem.requests.filter((r) => r.ipHash === ipHash && r.at >= shortSince).length,
      sameSourceDay: mem.requests.filter((r) => r.ipHash === ipHash && r.at >= daySince).length,
      allDay: mem.requests.filter((r) => r.at >= daySince).length,
    }
    mem.requests.push({ ipHash, at: now })
    return counts
  }
  const db = await driver()
  await ensureTables(db)
  await db.query(`DELETE FROM rdv_request_log WHERE at < NOW() - INTERVAL '48 hours'`)
  const { rows } = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE ip_hash = $1 AND at >= $2)::int AS short,
       COUNT(*) FILTER (WHERE ip_hash = $1 AND at >= $3)::int AS day,
       COUNT(*) FILTER (WHERE at >= $3)::int                  AS all_day
     FROM rdv_request_log`,
    [ipHash, new Date(shortSince).toISOString(), new Date(daySince).toISOString()],
  )
  await db.query(`INSERT INTO rdv_request_log (ip_hash) VALUES ($1)`, [ipHash])
  const r = rows[0] ?? {}
  return { sameSourceShort: Number(r.short ?? 0), sameSourceDay: Number(r.day ?? 0), allDay: Number(r.all_day ?? 0) }
}
