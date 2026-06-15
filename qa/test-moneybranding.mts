// Teste ao vivo do método MoneyBranding: chama a generateCalendar REAL de produção
// (src/lib/claude.ts) pra um nicho e valida pilares + story do dia.
// Rodar:  npx dotenv-cli -e .env.local -- npx tsx qa/test-moneybranding.mts
import { generateCalendar } from "../src/lib/claude";
import type { ContentPillar } from "../src/lib/schema";

async function main() {
  const t0 = Date.now();
  const days = await generateCalendar("barbearia", "Barbearia do Zé", 7, 2026, {
    services: [
      { name: "Corte", price: "R$35" },
      { name: "Combo corte + barba", price: "R$50" },
    ],
    tone: "descontraido",
    differentials: "atendimento sem hora marcada, cerveja na espera",
    city: "Tramandaí",
    neighborhood: "Centro",
    recurringPromos: "Segunda do corte: R$25 o dia todo",
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  const counts: Record<string, number> = { atracao: 0, conexao: 0, conversao: 0, sem_pilar: 0 };
  let withStory = 0;
  let firstFiveOk = true;
  for (const d of days) {
    const p = d.pillar as ContentPillar | undefined;
    counts[p ?? "sem_pilar"]++;
    if (d.story && d.story.trim()) withStory++;
    if (d.day <= 5 && p === "conversao") firstFiveOk = false;
  }
  // conversão nunca dois dias seguidos?
  let consecutiveConv = false;
  for (let i = 1; i < days.length; i++) {
    if (days[i].pillar === "conversao" && days[i - 1].pillar === "conversao") consecutiveConv = true;
  }

  console.log(`\n=== Barbearia do Zé — Julho/2026 (${secs}s, ${days.length} dias) ===`);
  console.log("Pilares:", counts);
  console.log(`Dias com story: ${withStory}/${days.length}`);
  console.log(`Primeiros 5 dias sem conversão: ${firstFiveOk ? "OK" : "FALHOU"}`);
  console.log(`Conversão em dias seguidos: ${consecutiveConv ? "SIM (ruim)" : "não (ok)"}`);

  console.log("\n--- Amostra (dias 1, 2, 15) ---");
  for (const d of days.filter((x) => [1, 2, 15].includes(x.day))) {
    console.log(`\nDia ${d.day} [${d.type} · ${d.pillar ?? "?"}] ${d.theme}`);
    console.log(`  hook: ${d.hook}`);
    console.log(`  caption: ${d.caption}`);
    console.log(`  hashtags(${d.hashtags.length}): ${d.hashtags.join(" ")}`);
    console.log(`  story: ${d.story ?? "(nenhum)"}`);
  }
}

main().catch((e) => {
  console.error("FALHOU:", e);
  process.exit(1);
});
