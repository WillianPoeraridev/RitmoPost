/* Semeia usuários em idades diferentes pra validar a janela do cron de retenção.
   Uso: DATABASE_URL=... node qa/seed-retention-test.cjs [--cleanup] */
const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");
const sql = neon(process.env.DATABASE_URL);

const AGES = [0, 3, 7, 20, 25, 28, 40]; // dias desde o cadastro
const TAG = "@teste-retencao.com";

(async () => {
  if (process.argv.includes("--cleanup")) {
    const del = await sql`DELETE FROM "user" WHERE email LIKE ${"%" + TAG} RETURNING email`;
    console.log("removidos:", del.length);
    return;
  }
  await sql`DELETE FROM "user" WHERE email LIKE ${"%" + TAG}`;
  for (const age of AGES) {
    const id = crypto.randomUUID();
    const created = new Date(Date.now() - age * 86_400_000).toISOString();
    await sql`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at, plan, generations_used, whatsapp_opt_in, sent_emails)
      VALUES (${id}, ${"User D" + age}, ${"d" + age + TAG}, true, ${created}, ${created}, 'free', 0, false, '[]'::jsonb)`;
  }
  console.log("semeados:", AGES.map((a) => "d" + a).join(", "));
})();
