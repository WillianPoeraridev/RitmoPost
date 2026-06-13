-- Sequência de e-mails de retenção (Fase 2.5) — controle de envio.
-- Equivalente ao que `npx drizzle-kit push` aplica a partir de src/lib/schema.ts.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "sent_emails" jsonb NOT NULL DEFAULT '[]'::jsonb;
