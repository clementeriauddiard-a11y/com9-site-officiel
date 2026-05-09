-- ─────────────────────────────────────────────────────────────────────────────
-- COM'9 — Setup Supabase (à exécuter une seule fois dans SQL Editor)
-- Supabase Dashboard → SQL Editor → New query → coller → Run
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLE PHONES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS phones (
  id               TEXT PRIMARY KEY,
  brand            TEXT    NOT NULL,
  model            TEXT    NOT NULL,
  storage          TEXT    NOT NULL,
  color            TEXT    NOT NULL,
  battery          INTEGER NOT NULL DEFAULT 100,
  condition        TEXT    NOT NULL DEFAULT 'Très bon',
  com9score        INTEGER NOT NULL DEFAULT 90,
  price            INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'Disponible',
  image            TEXT             DEFAULT '',
  description      TEXT             DEFAULT '',
  labels           JSONB   NOT NULL DEFAULT '[]',
  whatsapp_message TEXT    NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ      DEFAULT NOW()
);

-- Autorise la clé anon à faire SELECT / INSERT / UPDATE / DELETE
-- (RLS désactivé par défaut → ces GRANTs suffisent)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phones TO authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. BUCKET STORAGE (images des téléphones)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'phones-images',
  'phones-images',
  true,                         -- accès public (URLs directement lisibles)
  5242880,                      -- 5 Mo max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. POLITIQUES STORAGE (autorise la clé anon à uploader / lire)
-- ═══════════════════════════════════════════════════════════════════════════

-- Supprimer les politiques existantes pour éviter les conflits (idempotent)
DROP POLICY IF EXISTS "com9_phones_upload"  ON storage.objects;
DROP POLICY IF EXISTS "com9_phones_read"    ON storage.objects;
DROP POLICY IF EXISTS "com9_phones_delete"  ON storage.objects;

-- Upload d'images (notre API valide le cookie admin avant d'appeler Supabase)
CREATE POLICY "com9_phones_upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'phones-images');

-- Lecture publique (affiché dans la marketplace)
CREATE POLICY "com9_phones_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'phones-images');

-- Suppression (pour changer l'image d'une annonce)
CREATE POLICY "com9_phones_delete" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'phones-images');
