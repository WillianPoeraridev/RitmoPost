# PostaJá — Roadmap Completo do Produto

> Calendário de conteúdo para Instagram gerado por IA em 10 segundos.
> Este arquivo é o documento vivo do produto — leia antes de qualquer mudança não-trivial.

---

## Visão

**PostaJá** resolve a "síndrome da tela em branco" de pequenos negócios brasileiros no Instagram.
O dono de uma barbearia digita o nome do negócio + nicho e em 10 segundos tem 30 dias de conteúdo:
tipo de post, ideia, legenda pronta, hashtags — exportado em PDF profissional com o nome do negócio.

### Por Que Vende Rápido

Dois momentos de WOW encadeados:
1. **WOW da velocidade**: "Isso foi gerado em 10 segundos?"
2. **WOW da personalização**: o PDF tem o nome da barbearia DELE. Parece feito à mão.

A tática de venda usa esses dois WOWs **antes de cobrar qualquer centavo**.

---

## Precificação

| Plano | Preço | O que inclui |
|-------|-------|--------------|
| **Free** | Grátis | 7 dias visíveis + PDF com marca d'água agressiva (demo do produto) |
| **Pro Mensal** | R$29,90/mês | 30 dias completos, PDF limpo, histórico 12 meses |
| **Pro Anual** | R$239/ano | Tudo do Pro + "economize 2 meses" (~R$19,90/mês) |

**Ancoragem futura:**
- Agência (Fase 3): R$89,90/mês — gerencia até 10 negócios
- White-label (Fase 3): R$199/mês — sem marca PostaJá

**Por que R$29,90 e não R$19,90:** a tática de demo-antes-de-pagar elimina resistência de preço.
Para o cliente, R$29,90 é menos que um corte de cabelo. Para nós, é +50% de receita por cliente.

> ⚠️ **Decisão crítica (feedback Fable):** o free tier original entregava o produto inteiro (30 dias + PDF).
> O cliente gera, baixa, e não volta — pode criar outro email no mês 2. Corrigido: free = 7 dias visíveis
> + PDF bloqueado ou com marca d'água agressiva. O WOW da demo continua, mas o paywall é real.

---

## Stack Técnica

```
Next.js 16 (App Router) + TypeScript strict
Neon PostgreSQL (serverless, free tier)
Drizzle ORM
Better Auth (email + senha — sem OAuth no MVP)
OpenRouter API — modelo configurável via OPENROUTER_MODEL (default: anthropic/claude-haiku-4-5)
@react-pdf/renderer — gera PDF no servidor
Stripe — PIX + cartão recorrente
Resend — emails transacionais
Vercel — deploy automático
```

### Custo de Manutenção

| Item | Custo |
|------|-------|
| Vercel hobby | $0 |
| Neon free tier | $0 |
| OpenRouter (100 clientes × 4 gerações, claude-haiku) | ~R$1,50/mês |
| Resend free tier | $0 |
| **Total até 500 clientes** | **< R$5/mês** |

Margem bruta com 100 clientes: R$2.990 - R$5 = **R$2.985/mês (~99%)**

---

## Schema do Banco

```typescript
// users
id: uuid
email: text (unique)
name: text
plan: enum('free', 'pro')
generations_used: integer (default 0)
stripe_customer_id: text (nullable)
stripe_subscription_id: text (nullable)
plan_expires_at: timestamp (nullable)
created_at: timestamp

// calendars
id: uuid
user_id: uuid (FK → users)
niche: text              // "Barbearia"
business_name: text      // "Barbearia do Zé"
month: integer           // 6 (junho)
year: integer            // 2026
content: jsonb           // Array de 30 dias (ver estrutura abaixo)
created_at: timestamp

// Estrutura do content (jsonb):
[{
  day: 1,
  type: "Reels" | "Carrossel" | "Story" | "Feed",
  theme: "Antes e Depois do Degradê",
  hook: "Esse corte mudou tudo 🔥",
  caption: "Transformação real aqui na Barbearia do Zé. Agende: [link]",
  hashtags: ["#barbearia", "#degradê", "#cortedecabelo"]
}]
```

---

## Estrutura de Pastas

```
src/
  app/
    page.tsx                      # Landing com demo ao vivo embutido
    (auth)/
      login/page.tsx
      cadastro/page.tsx
    dashboard/
      page.tsx                    # Lista de calendários + botão novo
    gerar/
      page.tsx                    # Form: nicho + nome + botão gerar
    calendario/
      [id]/
        page.tsx                  # Visualização grid 30 dias
        pdf/route.ts              # GET → retorna PDF binário
    admin/
      demo/page.tsx               # Gera sem paywall (ADMIN_SECRET)
    api/
      generate/route.ts           # POST → Claude API → salva DB
      stripe/
        checkout/route.ts         # POST → cria sessão Stripe
        webhook/route.ts          # POST → ativa plano após pagamento
      auth/[...all]/route.ts
  lib/
    db.ts                         # Drizzle + Neon
    schema.ts                     # Tabelas
    claude.ts                     # Prompt + chamada API
    stripe.ts                     # Cliente Stripe
    auth.ts                       # Better Auth config
    pdf.tsx                       # Layout react-pdf
  components/
    calendar-grid.tsx             # Grid 5×6 dos 30 dias
    day-card.tsx                  # Card individual (tipo + tema + legenda)
    generate-form.tsx             # 2 campos + botão gerar
    demo-section.tsx              # Demo embutida na landing (sem login)
```

---

## Prompt Claude (núcleo do produto — não altere sem testar)

```
Você é um especialista em marketing de conteúdo para Instagram no Brasil,
com profundo conhecimento do segmento "{niche}".

Crie um calendário de conteúdo de 30 dias para {month}/{year} para:
Negócio: {businessName}
Nicho: {niche}

Regras obrigatórias:
- Varie os formatos: ~40% Reels, ~30% Carrossel, ~20% Feed, ~10% Story
- Identifique datas comemorativas do mês e crie posts temáticos para elas
- Cada post deve ser ESPECÍFICO para o nicho — nunca genérico
- Legendas em português brasileiro informal, sem clichês, máximo 3 frases
- Hashtags: 6-8 por post, mix de genéricas e de nicho
- Hook deve parar o scroll em 2 segundos

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
[{
  "day": 1,
  "type": "Reels",
  "theme": "tema específico do post",
  "hook": "primeira frase que para o scroll",
  "caption": "legenda completa com CTA",
  "hashtags": ["#tag1", "#tag2"]
}]
```

---

## Variáveis de Ambiente (.env.local)

```env
DATABASE_URL=             # Neon → Settings → Connection string
BETTER_AUTH_SECRET=       # openssl rand -base64 32
BETTER_AUTH_URL=          # http://localhost:3000 (dev) | https://postaja.com.br (prod)
OPENROUTER_API_KEY=       # openrouter.ai → API Keys
OPENROUTER_MODEL=         # opcional — default: anthropic/claude-haiku-4-5
STRIPE_SECRET_KEY=        # dashboard.stripe.com → Developers → API keys
STRIPE_WEBHOOK_SECRET=    # stripe listen --forward-to localhost:3000/api/stripe/webhook
STRIPE_PRICE_ID_MONTHLY=  # ID do plano R$29,90/mês no Stripe
STRIPE_PRICE_ID_YEARLY=   # ID do plano R$239/ano no Stripe
RESEND_API_KEY=           # resend.com → API Keys
NEXT_PUBLIC_URL=          # URL pública (Vercel ou localhost)
ADMIN_SECRET=             # senha forte para /admin/demo
```

---

## Roadmap de Features

### Fase 0 — MVP (Dia 1) ✅ CONCLUÍDO
Core loop funcionando: gerar → ver → baixar PDF → pagar.

- [x] Setup Next.js 16 + Drizzle + Neon + Better Auth
- [x] Formulário: nicho + nome do negócio
- [x] Geração de calendário via OpenRouter (claude-haiku-4-5)
- [x] Grid visual 30 dias
- [x] Export PDF (react-pdf)
- [x] Paywall: free = 1 geração, pro = ilimitado
- [x] Stripe Checkout (PIX + Cartão)
- [x] Webhook Stripe → ativa plano
- [x] /admin/demo (gera sem paywall, para demos de venda)
- [x] Landing page com demo embutido sem login
- [x] Deploy em produção (Vercel + Neon) — https://postaja-gold.vercel.app

### Fase 1 — Primeiros 30 Dias ✅ CONCLUÍDO

- [x] Mês selecionável (atual + 2 próximos)
- [x] Datas comemorativas automáticas por mês (injetadas no prompt)
- [x] Regenerar dia específico individualmente
- [x] Link público de compartilhamento do calendário (/c/[id])
- [x] Email de boas-vindas via Resend
- [x] Watermark sutil no PDF: "Criado com PostaJá · postaja.com.br"
- [x] Botão "Copiar pra WhatsApp" (formatação bold/italic nativa)
- [ ] Plano anual no Stripe (R$239/ano) — aguardando primeiros clientes

### Fase 2 — 30 a 90 Dias ✅ CONCLUÍDO

- [x] Templates específicos por nicho (10 nichos com contexto rico)
- [x] Personalização de cor primária no PDF (6 cores, seletor no botão)
- [x] Roteiro de 30s para cada Reels (gerado por IA, exibido no card)
- [x] Modo agência: dashboard agrupado por negócio (?view=agencia)
- [x] Analytics de uso (PostHog integrado no layout)
- [ ] Upload de logo no PDF — requer storage (S3/R2), próxima fase
- [ ] Programa de referral — requer base de usuários, próxima fase

### Fase 2.5 — Retenção (URGENTE, antes da Fase 3)

> Feedback Fable: churn real de produto com uso mensal único é 10-15%, não 5%.
> Com 12% de churn e 20 novos/mês, o teto natural é ~165 clientes, não 700.
> A feature de retenção mais importante está errada de fase — sobe aqui.

- [ ] **WhatsApp Bot: post do dia** — manda o conteúdo do dia automaticamente via Evolution API (é o que muda de ferramenta pra hábito diário)
- [ ] Free tier: limitar a 7 dias visíveis + bloquear PDF (forçar conversão real)
- [ ] Marca d'água agressiva no PDF free: "DESBLOQUEIE EM POSTAJA.COM.BR"
- [ ] Sequência de emails D+3, D+7, D+20, D+28 (já desenhada, falta implementar)
- [ ] Notificação "novo mês chegando" no D+25

### Fase 3 — 90 a 180 Dias

- [ ] Integração Meta Business Suite (agenda direto no Instagram)
- [ ] Gerador de arte básica (fundo + texto + logo via Canvas API)
- [ ] White-label para agências
- [ ] API pública
- [ ] Upload de logo no PDF (requer S3/R2)

---

## Estratégia de Vendas — Instagram 1-on-1

### Perfil do Lead Ideal

- Instagram com menos de 2 posts/semana
- Mais de 200 seguidores (negócio real)
- Serviço local: barbearia, salão, estética, personal, lanchonete
- Bio menciona horário ou cidade

Como encontrar: `#barbeariabh`, `#salaodesaopaulo`, `#personaltrainercwb`, etc.

### Script de Abordagem (DM)

**Versão A — Direto:**
> "Ei [nome]! Vi o trabalho de vocês na [nome do negócio], ficou incrível.
> Só vi que vocês postam pouco ultimamente — o Instagram tem muito potencial ainda.
> Desenvolvi uma ferramenta que gera o calendário de posts de um mês inteiro pro nicho de [nicho] em 10 segundos — Reels, carrossel, legendas prontas.
> Posso gerar o de julho da [nome do negócio] e te mandar aqui pra você ver? Sem compromisso."

**Versão B — Curiosidade:**
> "Boa tarde! Pergunta rápida: quanto tempo você gasta por semana pensando no que postar no Instagram da [nome]?"

### O Pitch Após Demo

1. Entra em `/admin/demo`
2. Digita nicho + nome EXATO do negócio
3. Gera e baixa o PDF
4. Manda pelo WhatsApp/DM
5. Espera a reação (~30s)
6. Manda a oferta:

> "Isso foi gerado em 10 segundos. R$29,90/mês pra ter isso todo mês, ilimitado. Menos que um corte.
> Quer o link pra ativar? É só PIX ou cartão."

### Objeções e Respostas

| Objeção | Resposta |
|---------|---------|
| "Tá caro" | "É menos que um delivery. Se um post novo trouxer 1 cliente, já se pagou." |
| "Não sei se vou usar" | "Você já tem o PDF do mês aqui. Posta amanhã qualquer um e me conta. 30 dias pra testar." |
| "Tenho que pensar" | "Claro. Mas R$29,90 é de lançamento — vou subir no mês que vem." |
| "Já tenho quem cuide" | "Manda o PDF pra ela então — vai economizar horas de planejamento." |

---

## Canais de Marketing

| Canal | Quando | O que fazer |
|-------|--------|-------------|
| Instagram 1-on-1 | Hoje | 10-20 abordagens/dia com demo personalizado |
| Reels do processo | Semana 1 | Gravar geração ao vivo — "calendário em 10s" |
| Landing page demo | Semana 1 | Demo sem login na homepage já converte |
| Grupos WhatsApp | Mês 1 | Grupos de MEI, empreendedores, donos de barbearia |
| SEO | Mês 2+ | "calendário de posts para barbearia", "o que postar no instagram de salão" |
| Parcerias | Mês 3+ | Distribuidores de produto para salão, associações de categoria |

---

## Sequência de Emails (Resend)

```
D+0   "Seu acesso está ativo. Gere seu primeiro calendário →"
D+3   "Qual tipo de post performa melhor no seu nicho?"
D+7   "Faltam 23 dias no mês — já gerou seu calendário?"
D+20  "Semana que vem é novo mês. Gere o de [próximo mês] →"
D+28  "Em uma palavra, como foi o PostaJá este mês?" (NPS)
```

---

## Projeção Financeira

### Cenário Realista (12% churn, sem WhatsApp Bot)

| Mês | Novos | Churn | Clientes | MRR | Lucro |
|-----|-------|-------|----------|-----|-------|
| 1 | 20 | 0 | 20 | R$598 | R$593 |
| 2 | 20 | 2 | 38 | R$1.136 | R$1.131 |
| 3 | 20 | 5 | 53 | R$1.585 | R$1.580 |
| 6 | 20 | 16 | ~110 | R$3.289 | R$3.284 |
| 12 | 20 | estabiliza | ~165 | R$4.934 | R$4.929 |

*12% churn mensal — teto natural sem retenção ativa ~165 clientes*

### Cenário Com WhatsApp Bot (uso diário = retenção real)

| Mês | Clientes | MRR | Lucro |
|-----|----------|-----|-------|
| 6 | 200 | R$5.980 | R$5.975 |
| 12 | 450 | R$13.455 | R$13.450 |

*Churn estimado 4-6% com uso diário via bot — muda de ferramenta pra hábito*

**Break-even: 4 clientes** (pagam a infra inteira).

> ⚠️ **Conclusão Fable:** sem o WhatsApp Bot, o produto tem uso mensal único e churn alto.
> O bot é a feature de retenção #1 — está mal posicionado na Fase 3, sobe pra Fase 2.5.

---

## Próximos Marcos

| Marco | Critério |
|-------|---------|
| MVP no ar | Fluxo completo: cadastro → gerar → PDF → pagar |
| 1º cliente pago | 1 venda via Instagram |
| 10 clientes | R$299/mês MRR |
| 50 clientes | R$1.495/mês — produto validado |
| 100 clientes | R$2.990/mês — escala confirmada |
| 300 clientes | R$8.970/mês — contrata 1 pessoa de suporte |

---

## Comandos Comuns

```bash
npm run dev              # dev local
npm run build            # build de produção
npx drizzle-kit push     # aplicar schema no Neon (desenvolvimento)
npx drizzle-kit generate # gerar migration
npx drizzle-kit migrate  # aplicar migration
npx drizzle-kit studio   # Drizzle Studio (visualizar DB)
stripe listen --forward-to localhost:3000/api/stripe/webhook  # testar webhooks
```

---

## O Que NÃO Fazer

- ❌ Usar `any` em TypeScript sem justificativa
- ❌ Chamar Claude API sem validar o JSON de retorno com Zod
- ❌ Fazer alteração no prompt sem testar ao menos 5 nichos diferentes
- ❌ Deploy sem testar o fluxo completo de pagamento (modo teste do Stripe)
- ❌ Adicionar feature sem validar se os primeiros 50 clientes pedem
- ❌ Subir secrets para o repositório

---

*Última atualização: 2026-06-12 — Fases 0, 1 e 2 concluídas. Fase 2.5 (retenção) priorizando WhatsApp Bot.*
