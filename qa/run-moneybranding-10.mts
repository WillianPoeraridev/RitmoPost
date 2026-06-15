// QA do método MoneyBranding nos 10 nichos — chama a generateCalendar REAL de
// produção pra cada perfil fictício (sem servidor) e mede pilares + story + as
// métricas do QA anterior (hashtags, legendas, preço, refs locais).
// Rodar: npx dotenv-cli -e .env.local -- npx tsx qa/run-moneybranding-10.mts
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateCalendar } from "../src/lib/claude";
import type { CalendarDay } from "../src/lib/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const profiles = JSON.parse(readFileSync(join(__dirname, "perfis-ficticios.json"), "utf8"));
const outDir = join(__dirname, "results", "moneybranding");
mkdirSync(outDir, { recursive: true });

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-");

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

type Row = {
  niche: string;
  secs: string;
  atracao: number;
  conexao: number;
  conversao: number;
  semPilar: number;
  stories: number;
  first5Ok: boolean;
  noConsecConv: boolean;
  reels: number;
  hashLow: number;
  longCaps: number;
  priceDays: number;
  localDays: number;
};

function analyze(niche: string, secs: string, days: CalendarDay[], p: any): Row {
  const c = { atracao: 0, conexao: 0, conversao: 0, semPilar: 0 };
  let stories = 0, reels = 0, hashLow = 0, longCaps = 0, priceDays = 0, localDays = 0;
  let first5Ok = true, noConsecConv = true;
  const city = norm(p.city || ""), hood = norm(p.neighborhood || "");

  days.forEach((d, i) => {
    c[(d.pillar ?? "semPilar") as keyof typeof c]++;
    if (d.story?.trim()) stories++;
    if (d.type === "Reels") reels++;
    if (d.hashtags.length < 6) hashLow++;
    const sentences = d.caption.split(/[.!?]+/).filter((s) => s.trim()).length;
    if (sentences > 3) longCaps++;
    if (/R\$\s?\d/.test(`${d.caption} ${d.hook}`)) priceDays++;
    const blob = norm(`${d.theme} ${d.hook} ${d.caption} ${d.story ?? ""}`);
    if ((city && blob.includes(city)) || (hood && blob.includes(hood))) localDays++;
    if (d.day <= 5 && d.pillar === "conversao") first5Ok = false;
    if (i > 0 && d.pillar === "conversao" && days[i - 1].pillar === "conversao") noConsecConv = false;
  });

  return { niche, secs, ...c, stories, first5Ok, noConsecConv, reels, hashLow, longCaps, priceDays, localDays };
}

(async () => {
  const rows: Row[] = [];
  for (const p of profiles) {
    const services = (p.servicesText as string)
      .split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
    const t0 = Date.now();
    try {
      const days = await generateCalendar(p.niche, p.businessName, month, year, {
        services, tone: p.tone, differentials: p.differentials,
        city: p.city, neighborhood: p.neighborhood, recurringPromos: p.recurringPromos,
      });
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      writeFileSync(join(outDir, `${slug(p.niche)}.json`), JSON.stringify({ profile: p, days }, null, 2));
      const row = analyze(p.niche, secs, days, p);
      rows.push(row);
      console.log(`[ok] ${p.niche} (${secs}s) — pilares ${row.atracao}/${row.conexao}/${row.conversao} semPilar:${row.semPilar} story:${row.stories}/30`);
    } catch (e) {
      console.error(`[FAIL] ${p.niche}:`, e instanceof Error ? e.message : e);
    }
  }

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log("\n=== TABELA (alvo: pilares ~12/12/6, story 30/30, first5 OK, sem conv seguida) ===");
  console.log(pad("Nicho", 18), pad("A/C/V", 10), pad("sem", 4), pad("story", 6), pad("1os5", 5), pad("cons", 5), pad("reels", 6), pad("hash<6", 7), pad("legL", 5), pad("preço", 6), pad("local", 6));
  for (const r of rows) {
    console.log(
      pad(r.niche, 18),
      pad(`${r.atracao}/${r.conexao}/${r.conversao}`, 10),
      pad(r.semPilar, 4),
      pad(`${r.stories}/30`, 6),
      pad(r.first5Ok ? "ok" : "X", 5),
      pad(r.noConsecConv ? "ok" : "X", 5),
      pad(r.reels, 6),
      pad(r.hashLow, 7),
      pad(r.longCaps, 5),
      pad(`${r.priceDays}/30`, 6),
      pad(`${r.localDays}/30`, 6),
    );
  }
  const n = rows.length || 1;
  const sum = (k: keyof Row) => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  console.log("\nMédias:",
    `atracao ${(sum("atracao") / n).toFixed(1)},`,
    `conexao ${(sum("conexao") / n).toFixed(1)},`,
    `conversao ${(sum("conversao") / n).toFixed(1)},`,
    `semPilar total ${sum("semPilar")},`,
    `story ${(sum("stories") / n).toFixed(1)}/30,`,
    `first5 ok ${rows.filter((r) => r.first5Ok).length}/${rows.length},`,
    `sem conv seguida ${rows.filter((r) => r.noConsecConv).length}/${rows.length}`);
})();
