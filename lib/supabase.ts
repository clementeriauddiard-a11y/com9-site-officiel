// ─────────────────────────────────────────────────────────────────────────────
// COM'9 — Client Supabase (server-side uniquement)
// Variables requises : SUPABASE_URL + SUPABASE_SERVICE_KEY
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null

  // Singleton pour éviter de recréer le client à chaque requête
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false },
    })
  }
  return _client
}
