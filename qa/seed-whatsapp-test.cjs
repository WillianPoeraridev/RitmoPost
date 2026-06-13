/* Cria usuário Pro de teste com WhatsApp + calendário cobrindo o dia de hoje (BRT),
   pra exercitar /api/cron/whatsapp-daily contra o mock-evolution.
   Uso: DATABASE_URL=... node qa/seed-whatsapp-test.cjs [--cleanup] */
const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");

const sql = neon(process.env.DATABASE_URL);
const EMAIL = "qa-whatsapp@teste-ritmopost.com";

function todayInBrazil() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}

(async () => {
  if (process.argv.includes("--cleanup")) {
    const del = await sql`DELETE FROM "user" WHERE email = ${EMAIL} RETURNING email`;
    console.log("removido:", del.map((r) => r.email));
    return;
  }

  const t = todayInBrazil();
  const userId = crypto.randomUUID();
  const calId = crypto.randomUUID();
  const content = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    type: "Reels",
    theme: `Tema do dia ${i + 1}`,
    hook: `Hook do dia ${i + 1}`,
    caption: `Legenda de teste do dia ${i + 1} com CTA. Combo R$50.`,
    hashtags: ["#teste", "#ritmopost"],
  }));

  await sql`DELETE FROM "user" WHERE email = ${EMAIL}`;
  await sql`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at, plan, generations_used, whatsapp_number, whatsapp_opt_in)
    VALUES (${userId}, 'QA WhatsApp', ${EMAIL}, true, now(), now(), 'pro', 0, '5551999998888', true)`;
  await sql`INSERT INTO calendar (id, user_id, niche, business_name, month, year, content, created_at)
    VALUES (${calId}, ${userId}, 'Barbearia', 'Barbearia QA Zap', ${t.month}, ${t.year}, ${JSON.stringify(content)}::jsonb, now())`;

  console.log(`seed ok: hoje BRT = ${t.day}/${t.month}/${t.year}, user=${userId}`);
})();
