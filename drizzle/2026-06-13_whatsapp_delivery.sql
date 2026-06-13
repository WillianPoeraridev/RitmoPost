-- WhatsApp delivery (sprint dias 4-5) — lado do app.
-- Equivalente ao que `npx drizzle-kit push` aplica a partir de src/lib/schema.ts.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "whatsapp_number" text,
  ADD COLUMN IF NOT EXISTS "whatsapp_opt_in" boolean NOT NULL DEFAULT false;
