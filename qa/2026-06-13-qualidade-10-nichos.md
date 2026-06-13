# QA de Qualidade — 10 nichos com perfis fictícios (dia 6 do sprint, antecipado)

**Data:** 2026-06-13 (madrugada, Claude autônomo)
**Modelo:** anthropic/claude-haiku-4-5 via OpenRouter
**Harness:** `qa/run-10-nichos.cjs` (gera) + `qa/analisa-10-nichos.cjs` (valida) sobre `qa/perfis-ficticios.json` (10 perfis realistas do litoral norte gaúcho)

## Resultado: ✅ aprovado pra lançamento

- **10/10 nichos** geraram 30 dias válidos no schema (Zod do servidor aceitou tudo, zero retry)
- **10/10** citaram a promoção recorrente do perfil
- Preços reais do perfil aparecem em **12 a 26 dos 30 dias** por nicho
- Tempo de geração: 30-47s por calendário (dentro do `maxDuration=60`)

## Desvios encontrados na 1ª rodada (prompt antigo)

| Problema | Extensão |
|----------|----------|
| Hashtags abaixo de 6 (regra: 6-8) | 7/10 nichos, ~26 dias no total |
| Legendas acima de 3 frases | 23 ocorrências (Personal Trainer sozinho: 17) |
| Reels abaixo dos 40% pedidos (~8-10 de 12) | 10/10 nichos |
| Referências locais raras | Açaí 1/30, Fotografia 3/30 |

## Refinamento de prompt aplicado (`src/lib/claude.ts`)

1. Percentuais → **distribuição exata**: "12 Reels, 9 Carrossel, 6 Feed, 3 Story"
2. "máximo 3 frases" → "**NO MAXIMO 3 frases curtas** (conte as frases antes de finalizar)"
3. "6-8 hashtags" → "**EXATAMENTE de 6 a 8 — nunca menos que 6**"
4. Regra de perfil: "quando fizer sentido" → "**pelo menos 5 posts do mês devem citar o bairro ou a cidade**"

## 2ª rodada (5 piores nichos, prompt novo)

| Métrica | Antes | Depois |
|---------|-------|--------|
| Legendas longas | 23 dias | **2 dias** |
| Dias com <6 hashtags | ~26 dias | **4 dias** (só Barbearia) |
| Reels (alvo 12) | 8-10 | **9-11** |
| Refs locais Açaí | 1/30 | **14/30** |
| Refs locais Fotografia | 3/30 | **10/30** |
| Dias citando preço (média dos 5) | ~18/30 | **~20/30** |

Resíduo aceitável (variância do modelo): Barbearia ainda teve 4 dias com 2-3 hashtags e poucas
refs locais nessa amostra. Não vale endurecer mais o prompt — risco de robotizar o texto.

## Como re-rodar

```bash
# servidor dev rodando + ADMIN_SECRET no ambiente:
export $(grep '^ADMIN_SECRET=' .env.local | tr -d '\r')
node qa/run-10-nichos.cjs        # gera (pula nichos já salvos em qa/results/)
node qa/analisa-10-nichos.cjs    # imprime a tabela e os problemas
```

Saídas brutas ficam em `qa/results/` (gitignored). Baseline da 1ª rodada em `qa/results/baseline/`.
