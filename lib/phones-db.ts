// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Base de données téléphones (Supabase PostgreSQL)
//
// Table : phones
// Sans SUPABASE_URL/SERVICE_KEY → fallback mémoire pour dev local
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabase } from './supabase'
import type { Phone, PhoneCondition, PhoneStatus } from '@/data/phones'

const TABLE = 'phones'

// ─── Fallback mémoire (dev local sans Supabase) ───────────────────────────────
let _mem: Phone[] | null = null

// ─── Mapping DB ↔ Phone ───────────────────────────────────────────────────────

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
    labels:          (row.labels as string[]) ?? [],
    whatsappMessage: String(row.whatsapp_message ?? ''),
  }
}

function phoneToInsertRow(phone: Phone): Record<string, unknown> {
  return {
    id:               phone.id,
    brand:            phone.brand,
    model:            phone.model,
    storage:          phone.storage,
    color:            phone.color,
    battery:          phone.battery,
    condition:        phone.condition,
    com9score:        phone.com9Score,
    price:            phone.price,
    status:           phone.status,
    image:            phone.image           ?? '',
    description:      phone.description     ?? '',
    labels:           phone.labels,
    whatsapp_message: phone.whatsappMessage,
  }
}

function partialToUpdateRow(data: Partial<Phone>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (data.brand            !== undefined) row.brand            = data.brand
  if (data.model            !== undefined) row.model            = data.model
  if (data.storage          !== undefined) row.storage          = data.storage
  if (data.color            !== undefined) row.color            = data.color
  if (data.battery          !== undefined) row.battery          = data.battery
  if (data.condition        !== undefined) row.condition        = data.condition
  if (data.com9Score        !== undefined) row.com9score        = data.com9Score
  if (data.price            !== undefined) row.price            = data.price
  if (data.status           !== undefined) row.status           = data.status
  if (data.image            !== undefined) row.image            = data.image
  if (data.description      !== undefined) row.description      = data.description
  if (data.labels           !== undefined) row.labels           = data.labels
  if (data.whatsappMessage  !== undefined) row.whatsapp_message = data.whatsappMessage
  return row
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getPhones(): Promise<Phone[]> {
  const sb = getSupabase()
  if (!sb) return _mem ?? []

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToPhone)
}

export async function addPhone(phone: Phone): Promise<Phone[]> {
  const sb = getSupabase()
  if (!sb) {
    _mem = [...(_mem ?? []), phone]
    return [..._mem]
  }

  const { error } = await sb.from(TABLE).insert(phoneToInsertRow(phone))
  if (error) throw new Error(error.message)
  return getPhones()
}

export async function updatePhone(id: string, data: Partial<Phone>): Promise<Phone[]> {
  const sb = getSupabase()
  if (!sb) {
    _mem = (_mem ?? []).map(p => p.id === id ? { ...p, ...data } : p)
    return [..._mem]
  }

  const row = partialToUpdateRow(data)
  if (Object.keys(row).length === 0) return getPhones()

  const { error } = await sb.from(TABLE).update(row).eq('id', id)
  if (error) throw new Error(error.message)
  return getPhones()
}

export async function deletePhone(id: string): Promise<Phone[]> {
  const sb = getSupabase()
  if (!sb) {
    _mem = (_mem ?? []).filter(p => p.id !== id)
    return [...(_mem)]
  }

  const { error } = await sb.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
  return getPhones()
}
