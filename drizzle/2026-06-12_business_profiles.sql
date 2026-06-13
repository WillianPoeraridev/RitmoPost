-- Perfil do Negócio (sprint dias 2-3)
-- Equivalente ao que `npx drizzle-kit push` vai aplicar a partir de src/lib/schema.ts.
-- Deixado aqui para revisão antes de tocar o banco de produção (Neon).

CREATE TABLE IF NOT EXISTS "business_profiles" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "business_name" text NOT NULL,
  "niche" text NOT NULL,
  "services" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "tone" text NOT NULL DEFAULT 'descontraido',
  "differentials" text NOT NULL DEFAULT '',
  "city" text NOT NULL DEFAULT '',
  "neighborhood" text NOT NULL DEFAULT '',
  "recurring_promos" text,
  "instagram_handle" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

-- Nullable: calendários antigos (pré-perfil) continuam válidos com profile_id NULL.
ALTER TABLE "calendar"
  ADD COLUMN IF NOT EXISTS "profile_id" text REFERENCES "business_profiles"("id") ON DELETE SET NULL;
