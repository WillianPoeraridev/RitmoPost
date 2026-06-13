/* Roda a geração nos 10 nichos com perfis fictícios (dia 6 do sprint).
   Uso: ADMIN_SECRET=... node qa/run-10-nichos.cjs [baseUrl]
   Salva cada resposta em qa/results/<nicho>.json e imprime um resumo por nicho. */
const fs = require("fs");
const path = require("path");

const BASE = process.argv[2] || "http://localhost:3000";
const SECRET = process.env.ADMIN_SECRET;
if (!SECRET) {
  console.error("ADMIN_SECRET não definido");
  process.exit(1);
}

const profiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, "perfis-ficticios.json"), "utf8")
);
const outDir = path.join(__dirname, "results");
fs.mkdirSync(outDir, { recursive: true });

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");

(async () => {
  for (const p of profiles) {
    const file = path.join(outDir, `${slug(p.niche)}.json`);
    if (fs.existsSync(file)) {
      console.log(`[skip] ${p.niche} — já gerado`);
      continue;
    }
    const started = Date.now();
    try {
      const res = await fetch(`${BASE}/api/admin/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, secret: SECRET }),
      });
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      if (!res.ok) {
        const body = await res.text();
        console.error(`[FAIL] ${p.niche} — HTTP ${res.status} em ${secs}s: ${body.slice(0, 200)}`);
        continue;
      }
      const data = await res.json();
      fs.writeFileSync(file, JSON.stringify({ profile: p, ...data }, null, 2));
      console.log(`[ok] ${p.niche} — ${data.days.length} dias em ${secs}s`);
    } catch (e) {
      console.error(`[FAIL] ${p.niche} — ${e.message}`);
    }
  }
})();
