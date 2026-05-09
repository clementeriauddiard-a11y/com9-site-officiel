// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Base de données téléphones (Vercel Postgres)
//
// La table `phones` est créée automatiquement au premier appel API.
// Aucune action manuelle nécessaire.
//
// Sans POSTGRES_URL → fallback mémoire (dev local)
// ─────────────────────────────────────────────────────────────────────────────

import type { Phone, PhoneCondition, PhoneStatus } from '@/data/phones'

// ─── Fallback mémoire (dev local sans base de données) ───────────────────────
let _mem: Phone[] = []

// ─── Flag création table (chaud lambda) ──────────────────────────────────────
let _tableReady = false

function isDbAvailable(): boolean {
  return !!process.env.POSTGRES_URL
}

// ─── Mapping DB row → Phone ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPhone(row: any): Phone {
  return {
    id:              String(row.id),
    brand:           String(row.brand),
    model:           String(row.model),
    storage:         String(row.storage),
    color:           String(row.color),
    battery:         Number(row.battery),
    condition:       String(row.condition) as PhoneCondition,
    com9Score:       Number(row.com9score),
    price:           Number(row.price),
    status:          String(row.status) as PhoneStatus,
    image:           String(row.image   ?? ''),
    description:     String(row.description ?? ''),
    labels:          Array.isArray(row.labels) ? row.labels : JSON.parse(String(row.labels ?? '[]')),
    whatsappMessage: String(row.whatsapp_message ?? ''),
  }
}

// ─── Auto-création table (une seule fois par démarrage serveur) ───────────────

async function ensureTable() {
  if (_tableReady) return
  const { sql } = await import('@vercel/postgres')
  await sql`
    CREATE TABLE IF NOT EXISTS phones (
      id               TEXT        PRIMARY KEY,
      brand            TEXT        NOT NULL,
      model            TEXT        NOT NULL,
      storage          TEXT        NOT NULL,
      color            TEXT        NOT NULL,
      battery          INTEGER     NOT NULL DEFAULT 100,
      condition        TEXT        NOT NULL DEFAULT 'Tres bon',
      com9score        INTEGER     NOT NULL DEFAULT 90,
      price            INTEGER     NOT NULL DEFAULT 0,
      status           TEXT        NOT NULL DEFAULT 'Disponible',
      image            TEXT                 DEFAULT '',
      description      TEXT                 DEFAULT '',
      labels           JSONB       NOT NULL DEFAULT '[]',
      whatsapp_message TEXT        NOT NULL DEFAULT '',
      created_at       TIMESTAMPTZ          DEFAULT NOW()
    )
  `
  _tableReady = true
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getPhones(): Promise<Phone[]> {
  if (!isDbAvailable()) return [..._mem]

  const { sql } = await import('@vercel/postgres')
  await ensureTable()
  const { rows } = await sql`SELECT * FROM phones ORDER BY created_at ASC`
  return rows.map(rowToPhone)
}

export async function addPhone(phone: Phone): Promise<Phone[]> {
  if (!isDbAvailable()) {
    _mem = [..._mem, phone]
    return [..._mem]
  }

  const { sql } = await import('@vercel/postgres')
  await ensureTable()

  await sql`
    INSERT INTO phones
      (id, brand, model, storage, color, battery, condition, com9score,
       price, status, image, description, labels, whatsapp_message)
    VALUES
      (${phone.id}, ${phone.brand}, ${phone.model}, ${phone.storage},
       ${phone.color}, ${phone.battery}, ${phone.condition}, ${phone.com9Score},
       ${phone.price}, ${phone.status}, ${phone.image ?? ''},
       ${phone.description ?? ''}, ${JSON.stringify(phone.labels)},
       ${phone.whatsappMessage})
  `
  return getPhones()
}

export async function updatePhone(id: string, data: Partial<Phone>): Promise<Phone[]> {
  if (!isDbAvailable()) {
    _mem = _mem.map(p => p.id === id ? { ...p, ...data } : p)
    return [..._mem]
  }

  const { sql } = await import('@vercel/postgres')
  await ensureTable()

  // Récupère le téléphone actuel, fusionne les changements, met tout à jour
  const { rows } = await sql`SELECT * FROM phones WHERE id = ${id}`
  if (rows.length === 0) return getPhones()

  const merged = { ...rowToPhone(rows[0]), ...data }

  await sql`
    UPDATE phones SET
      brand            = ${merged.brand},
      model            = ${merged.model},
      storage          = ${merged.storage},
      color            = ${merged.color},
      battery          = ${merged.battery},
      condition        = ${merged.condition},
      com9score        = ${merged.com9Score},
      price            = ${merged.price},
      status           = ${merged.status},
      image            = ${merged.image ?? ''},
      description      = ${merged.description ?? ''},
      labels           = ${JSON.stringify(merged.labels)},
      whatsapp_message = ${merged.whatsappMessage}
    WHERE id = ${id}
  `
  return getPhones()
}

export async function deletePhone(id: string): Promise<Phone[]> {
  if (!isDbAvailable()) {
    _mem = _mem.filter(p => p.id !== id)
    return [..._mem]
  }

  const { sql } = await import('@vercel/postgres')
  await ensureTable()
  await sql`DELETE FROM phones WHERE id = ${id}`
  return getPhones()
}
