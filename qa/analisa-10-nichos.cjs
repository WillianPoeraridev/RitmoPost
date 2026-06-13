/* Analisa os resultados de qa/results/*.json (dia 6 do sprint).
   Checa: 30 dias, schema Zod-like, distribuição de formatos, citação de preços,
   referências locais, tamanho de legenda, hashtags. Imprime relatório em markdown. */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "results");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

const TYPES = ["Reels", "Carrossel", "Story", "Feed"];
const rows = [];
const problems = [];

for (const f of files) {
  const { profile, days } = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!profile || !days) continue; // ignora artefatos de outros testes (ex: whatsapp-sent.json)
  const niche = profile.niche;

  // validação estrutural (espelha o zod do servidor)
  const structIssues = [];
  if (days.length !== 30) structIssues.push(`${days.length} dias (esperado 30)`);
  for (const d of days) {
    if (typeof d.day !== "number" || !TYPES.includes(d.type) || !d.theme || !d.hook || !d.caption || !Array.isArray(d.hashtags)) {
      structIssues.push(`dia ${d.day}: campo inválido`);
    }
    if (d.hashtags.length < 4 || d.hashtags.length > 10) {
      structIssues.push(`dia ${d.day}: ${d.hashtags.length} hashtags`);
    }
    const sentences = d.caption.split(/[.!?]+/).filter((s) => s.trim()).length;
    if (sentences > 5) structIssues.push(`dia ${d.day}: legenda longa (${sentences} frases)`);
  }

  // distribuição de formatos
  const dist = Object.fromEntries(TYPES.map((t) => [t, days.filter((d) => d.type === t).length]));

  // citação de preços do perfil
  const prices = [...profile.servicesText.matchAll(/R\$\s?[\d.,]+/g)].map((m) =>
    m[0].replace(/\s/g, "")
  );
  const allText = days.map((d) => `${d.theme} ${d.hook} ${d.caption}`).join(" ");
  const priceHits = prices.filter((p) => allText.includes(p)).length;
  const daysWithPrice = days.filter((d) => /R\$\s?\d/.test(`${d.caption} ${d.hook} ${d.theme}`)).length;

  // referências locais
  const localHits = days.filter((d) =>
    `${d.caption} ${d.hook} ${d.theme}`.includes(profile.neighborhood) ||
    `${d.caption} ${d.hook} ${d.theme}`.includes(profile.city)
  ).length;

  // promo recorrente citada?
  const promoWords = profile.recurringPromos.split(/\s+/).filter((w) => w.length > 4).slice(0, 3);
  const promoCited = promoWords.some((w) => allText.toLowerCase().includes(w.toLowerCase()));

  rows.push({
    niche,
    dist: `${dist.Reels}/${dist.Carrossel}/${dist.Feed}/${dist.Story}`,
    priceHits: `${priceHits}/${prices.length}`,
    daysWithPrice,
    localHits,
    promoCited: promoCited ? "sim" : "NÃO",
    structOk: structIssues.length === 0,
  });

  if (structIssues.length) problems.push(`**${niche}**: ${structIssues.join("; ")}`);
  if (daysWithPrice < 5) problems.push(`**${niche}**: só ${daysWithPrice} dias citam preço`);
  if (localHits < 3) problems.push(`**${niche}**: só ${localHits} referências locais`);
  if (!promoCited) problems.push(`**${niche}**: promoção recorrente não citada`);
}

console.log("| Nicho | Reels/Carr/Feed/Story | Preços do perfil citados | Dias c/ preço | Refs locais | Promo citada | Estrutura |");
console.log("|-------|----------------------|--------------------------|---------------|-------------|--------------|-----------|");
for (const r of rows) {
  console.log(
    `| ${r.niche} | ${r.dist} | ${r.priceHits} | ${r.daysWithPrice}/30 | ${r.localHits}/30 | ${r.promoCited} | ${r.structOk ? "✅" : "⚠️"} |`
  );
}
console.log("\n### Problemas encontrados\n");
console.log(problems.length ? problems.map((p) => `- ${p}`).join("\n") : "- Nenhum problema estrutural ou de personalização relevante.");
