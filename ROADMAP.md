# RitmoPost — Roadmap Completo do Produto

> O conteúdo do SEU negócio, entregue onde você vive (WhatsApp), sem nunca tocar na sua conta do Instagram.
> Este arquivo é o documento vivo do produto — leia antes de qualquer mudança não-trivial.

> ⚠️ **Domínio:** assumido `ritmopost.com.br` em código e docs. Se o TLD comprado for outro (`.app`, `.com`, etc.), é find-replace de 1 comando.

---

## 🔒 Sprint de Lançamento — trava de sócio

**Build total até 19/06/2026. Primeira DM dia 20/06/2026. Data travada — sem "só mais uma feature".**

7 dias de Claude Max é recurso que expira; usá-lo pra construir é racional. Mas a regra é: se dia 20 não sair DM, o problema nunca foi o produto.

| Dia | Foco | Status |
|-----|------|--------|
| **1** (12/06) | Fechar o free tier real (7 dias + PDF marca d'água) + rebrand RitmoPost + domínio | ✅ |
| **2-3** (13-14/06) | **Perfil do Negócio** — cadastro rico (serviços, preços, tom, bairro) injetado no prompt | ✅ na branch `feat/perfil-negocio` — migration aplicada + QA E2E passou; falta só revisar e mergear |
| **4-5** (15-16/06) | **WhatsApp delivery** — post do dia às 8h no zap, legenda pronta pra copiar (Evolution API) | ⏳ |
| **6** (17/06) | Qualidade — rodar geração nos 10 nichos com perfis fictícios reais, refinar prompts, validar Zod | ⏳ |
| **7** (18-19/06) | QA do fluxo completo + gravar Reels da demo + montar lista de 50 leads no Instagram | ⏳ |
| **20/06** | **PRIMEIRA DM.** | 🎯 |

---

## Visão

**RitmoPost** resolve a "síndrome da tela em branco" de pequenos negócios brasileiros no Instagram.
O nome carrega a promessa real: **ritmo** — constância de postagem, a dor exata do dono que posta 1x por mês.

O dono de uma barbearia cadastra o perfil do negócio (serviços, preços, tom de voz, bairro) e em segundos
tem 30 dias de conteúdo: tipo de post, ideia, legenda pronta, hashtags — citando o combo de R$50 dele,
o bairro dele, o jeito dele de falar. Exportado em PDF profissional e entregue todo dia no WhatsApp.

### Por Que Vende Rápido

Dois momentos de WOW encadeados:
1. **WOW da velocidade**: "Isso foi gerado em segundos?"
2. **WOW da personalização**: o calendário cita os serviços, preços e bairro DELE. O sobrinho com ChatGPT genérico não replica.

A tática de venda usa esses dois WOWs **antes de cobrar qualquer centavo**.

---

## Posicionamento Defensivo — pesquisa de concorrentes

Pesquisa no Reclame Aqui dos três principais BR mostra um padrão gritante: **todos quebram no mesmo lugar — a dependência da API da Meta.**

- **mLabs:** ~6 dias de tempo médio de resposta, suporte só seg-sex, posts agendados que somem e não publicam (usuária perdeu cliente), preços que dobram de surpresa, cancelamento tão difícil que gente cancela o cartão pra sair.
- **Postgrain:** contas de clientes bloqueadas pelo Instagram por suspeita de automação, desconexões constantes quebrando publicações agendadas (cliente de 5 anos cancelou).
- **Etus:** posts que a plataforma diz ter publicado mas não publicou, sem Reels com música.

A leitura estratégica é ouro: **o modelo de negócio deles (agendar e postar pela API) é a fonte de ~80% das reclamações.**

**O RitmoPost não conecta na conta do Instagram de ninguém.** Isso vira argumento de venda direto:

> "Sua conta nunca desconecta, nunca é bloqueada, nunca tem post que some — porque a gente não mexe nela.
> Você recebe o conteúdo pronto e posta em 30 segundos."

A "fraqueza" de não agendar virou o **diferencial defensivo**. E mata de vez a Fase 3 de integração Meta: **não integra, nunca.**

**Segundo gap:** nenhum concorrente **gera** conteúdo nicho-específico em PT-BR — são ferramentas de distribuição que assumem que você já tem o conteúdo. O concorrente real na geração é o ChatGPT grátis, e contra ele ganhamos com **profundidade de personalização** (Perfil do Negócio) que prompt genérico não alcança.

---

## Precificação

| Plano | Preço | O que inclui |
|-------|-------|--------------|
| **Free** | Grátis | 7 dias visíveis + PDF com marca d'água agressiva (demo do produto) |
| **Pro Mensal** | R$29,90/mês | 30 dias completos, PDF limpo, histórico 12 meses, WhatsApp delivery |
| **Pro Anual** | R$239/ano | Tudo do Pro + "economize 2 meses" (~R$19,90/mês) |

**Ancoragem futura:**
- Agência (Fase 3): R$89,90/mês — gerencia até 10 negócios
- White-label (Fase 3): R$199/mês — sem marca RitmoPost

**Por que R$29,90 e não R$19,90:** a tática de demo-antes-de-pagar elimina resistência de preço.
Para o cliente, R$29,90 é menos que um corte de cabelo. Para nós, é +50% de receita por cliente.

> ✅ **Free tier real (corrigido):** o free original entregava o produto inteiro (30 dias + PDF) — cliente gera, baixa, e cria outro email no mês 2.
> Agora free = 7 dias visíveis + PDF com marca d'água agressiva. O WOW da demo continua, o paywall é real. **Entregue e verificado em produção.**

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
Vercel — deploy automático (app web)
Evolution API (Docker em VPS) — WhatsApp delivery (processo persistente, fora da Vercel)
```

### Custo de Manutenção

| Item | Custo |
|------|-------|
| Vercel hobby | $0 |
| Neon free tier | $0 |
| OpenRouter (100 clientes × 4 gerações, claude-haiku) | ~R$1,50/mês |
| Resend free tier | $0 |
| VPS Evolution API (Hetzner CX22 ou similar) | ~R$28/mês |
| **Total até 500 clientes** | **~R$30/mês** |

Quebra o "infra < R$5" antigo, mas é o custo do diferencial de retenção (WhatsApp). **Break-even ainda é ~1 cliente.**

Margem bruta com 100 clientes: R$2.990 - R$30 = **~R$2.960/mês (~99%)**

---

## Schema do Banco

```typescript
// users
id, email (unique), name, plan: enum('free','pro')
generations_used (default 0)
stripe_customer_id?, stripe_subscription_id?, plan_expires_at?
created_at

// business_profiles  (NOVO — dias 2-3)
id: uuid
user_id: FK → users          // um usuário pode ter múltiplos perfis (modo agência)
business_name: text
niche: text
services: jsonb              // [{ name: string, price?: string }]
tone: enum('descontraido','profissional','premium')
differentials: text
city: text
neighborhood: text
recurring_promos: text?      // nullable
instagram_handle: text?      // nullable
created_at, updated_at

// calendars
id: uuid
user_id: FK → users
profile_id: FK → business_profiles?   // NOVO, nullable — calendários antigos continuam abrindo
niche: text
business_name: text
month: integer
year: integer
content: jsonb              // Array de 30 dias (ver abaixo)
created_at

// Estrutura do content (jsonb) — NÃO mudar o formato:
[{
  day: 1,
  type: "Reels" | "Carrossel" | "Story" | "Feed",
  theme: "Antes e Depois do Degradê",
  hook: "Esse corte mudou tudo 🔥",
  caption: "Transformação real aqui na Barbearia do Zé. Combo corte+barba R$50. Agende: [link]",
  hashtags: ["#barbearia", "#degradê", "#cortedecabelo"]
}]
```

---

## Prompt Claude (núcleo do produto — não altere sem testar)

Base atual (nicho + nome) será enriquecida com o Perfil do Negócio: serviços com preços, tom de voz,
diferenciais, cidade/bairro e promoções recorrentes injetados no prompt, com instruções para os posts
citarem serviços/preços reais e referências locais quando fizer sentido. **NÃO alterar o formato do JSON
de saída nem as regras de distribuição de formatos.**

```
Você é um especialista em marketing de conteúdo para Instagram no Brasil,
com profundo conhecimento do segmento "{niche}".

Crie um calendário de conteúdo de 30 dias para {month}/{year} para:
Negócio: {businessName}
Nicho: {niche}
{perfil: serviços e preços, tom de voz, diferenciais, cidade/bairro, promoções recorrentes}

Regras obrigatórias:
- Varie os formatos: ~40% Reels, ~30% Carrossel, ~20% Feed, ~10% Story
- Identifique datas comemorativas do mês e crie posts temáticos para elas
- Cite serviços e preços reais do perfil e referências locais (bairro/cidade) quando fizer sentido
- Cada post deve ser ESPECÍFICO para o nicho — nunca genérico
- Legendas em português brasileiro no tom de voz informado, sem clichês, máximo 3 frases
- Hashtags: 6-8 por post, mix de genéricas e de nicho
- Hook deve parar o scroll em 2 segundos

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
[{ "day": 1, "type": "Reels", "theme": "...", "hook": "...", "caption": "...", "hashtags": ["#tag1"] }]
```

---

## Variáveis de Ambiente (.env.local)

```env
DATABASE_URL=             # Neon → Settings → Connection string
BETTER_AUTH_SECRET=       # openssl rand -base64 32
BETTER_AUTH_URL=          # http://localhost:3000 (dev) | https://ritmopost.com.br (prod)
OPENROUTER_API_KEY=       # openrouter.ai → API Keys
OPENROUTER_MODEL=         # opcional — default: anthropic/claude-haiku-4-5
STRIPE_SECRET_KEY=        # dashboard.stripe.com → Developers → API keys
STRIPE_WEBHOOK_SECRET=    # stripe listen --forward-to localhost:3000/api/stripe/webhook
STRIPE_PRICE_ID_MONTHLY=  # ID do plano R$29,90/mês no Stripe
STRIPE_PRICE_ID_YEARLY=   # ID do plano R$239/ano no Stripe
RESEND_API_KEY=           # resend.com → API Keys
NEXT_PUBLIC_URL=          # URL pública (Vercel ou domínio)
ADMIN_SECRET=             # senha forte para /admin/demo
# WhatsApp delivery (dias 4-5)
EVOLUTION_API_URL=        # http://IP_DA_VPS:8080
EVOLUTION_API_KEY=        # chave global da instância Evolution
EVOLUTION_INSTANCE=       # nome da instância conectada ao número
```

---

## Roadmap de Features

### Fase 0 — MVP ✅ CONCLUÍDO
Core loop: gerar → ver → baixar PDF → pagar.

- [x] Setup Next.js 16 + Drizzle + Neon + Better Auth
- [x] Geração de calendário via OpenRouter (claude-haiku-4-5)
- [x] Grid visual 30 dias + Export PDF (react-pdf)
- [x] Stripe Checkout (PIX + Cartão) + Webhook → ativa plano
- [x] /admin/demo (gera sem paywall, para demos de venda)
- [x] Landing com demo embutido sem login
- [x] Deploy em produção (Vercel + Neon)
- [x] **Login estável** — corrigido bug de cookie no proxy do Next 16 (`__Secure-` em prod)
- [x] **Geração robusta** — `maxDuration=60`, `max_tokens` 8000, erros diagnosticáveis

### Fase 1 — Primeiros 30 Dias ✅ CONCLUÍDO

- [x] Mês selecionável (atual + 2 próximos)
- [x] Datas comemorativas automáticas por mês (injetadas no prompt)
- [x] Regenerar dia específico individualmente
- [x] Link público de compartilhamento (/c/[id])
- [x] Email de boas-vindas via Resend
- [x] Watermark no PDF + botão "Copiar pra WhatsApp"
- [ ] Plano anual no Stripe (R$239/ano) — aguardando primeiros clientes

### Fase 2 — 30 a 90 Dias ✅ CONCLUÍDO

- [x] Templates específicos por nicho (10 nichos com contexto rico)
- [x] Personalização de cor primária no PDF (6 cores)
- [x] Roteiro de 30s para cada Reels
- [x] Modo agência: dashboard agrupado por negócio (?view=agencia)
- [x] Analytics de uso (PostHog)

### Fase 2.5 — Sprint de Lançamento (ATUAL)

- [x] **Free tier real** — 7 dias visíveis + PDF marca d'água agressiva + cards bloqueados (sem vazar conteúdo) — *verificado em prod, 16/16 checks*
- [x] **Rebrand RitmoPost** + domínio
- [x] **Perfil do Negócio (dias 2-3)** — ✅ **pronto na branch `feat/perfil-negocio`, verificado E2E — falta só revisar e mergear**: tabela `business_profiles`, página `/perfil` (CRUD), fluxo `/gerar` por perfil (com modo manual de fallback), prompt enriquecido (serviços/preços, tom, bairro, promoções), regenerar-dia herda o perfil, `/admin/demo` com campos de perfil do prospect, retrocompat total (calendários antigos com `profile_id` NULL). **Migration já aplicada no Neon** (`drizzle-kit push`, DDL aditiva — SQL em `drizzle/2026-06-12_business_profiles.sql`). QA E2E via API passou: cadastro → criar/editar/excluir perfil → gerar com perfil (posts citaram o combo R$50, o Centro de Tramandaí e a promoção do perfil de teste) → regenerar dia herdando o perfil → paywall 402 intacto → calendário órfão (perfil excluído) abre e regenera → `/admin/demo` com perfil do prospect citou preço e bairro. Dados de teste removidos do banco.
- [ ] **WhatsApp delivery (dias 4-5)** — post do dia às 8h via Evolution API, legenda formatada pronta pra copiar (retenção: vira hábito diário)
- [ ] **Qualidade (dia 6)** — rodar 10 nichos com perfis fictícios, refinar prompts, validar Zod em todos os casos
- [ ] **QA + lançamento (dia 7)** — fluxo completo (cadastro → perfil → gerar → PDF → pagar → WhatsApp), Reels da demo, lista de 50 leads
- [ ] Sequência de emails D+3, D+7, D+20, D+28
- [ ] Notificação "novo mês chegando" no D+25

### Fase 3 — 90 a 180 Dias

- [ ] ~~Integração Meta Business Suite~~ — **MORTA por decisão estratégica.** Não integramos na conta do cliente: é o nosso diferencial defensivo. Nunca.
- [ ] Gerador de arte básica (fundo + texto + logo via Canvas API)
- [ ] White-label para agências
- [ ] Upload de logo no PDF (requer S3/R2)
- [ ] API pública

---

## Arquitetura WhatsApp Delivery (dias 4-5)

**Onde roda a Evolution API:** ela precisa de processo persistente (WebSocket Baileys), que a Vercel não suporta.
**Decisão:** VPS própria (Hetzner CX22, ~R$28/mês) rodando Evolution via Docker — controle total = a tese "a gente nunca toca na sua conta" é 100% nossa.

> ⚠️ Risco residual: Evolution é não-oficial (Baileys); o número que pode ser banido é **o NOSSO**, não o do cliente — o que preserva o pitch. Mitigação: warm-up, volume baixo, opt-in. Graduar pra WhatsApp Cloud API oficial quando doer.

Cron diário (Vercel Cron ou Trigger) → busca posts do dia dos usuários Pro → POST para Evolution API → mensagem formatada no zap.

*(Arquitetura detalhada a ser fechada com o Willian após decisão de hosting.)*

---

## Estratégia de Vendas — Instagram 1-on-1

### Perfil do Lead Ideal

- Instagram com menos de 2 posts/semana, mais de 200 seguidores (negócio real)
- Serviço local: barbearia, salão, estética, personal, lanchonete
- Bio menciona horário ou cidade

Como encontrar: `#barbeariabh`, `#salaodesaopaulo`, `#personaltrainercwb`, etc.

### Script de Abordagem (DM)

**Versão A — Direto:**
> "Ei [nome]! Vi o trabalho de vocês na [nome do negócio], ficou incrível.
> Só vi que vocês postam pouco ultimamente — o Instagram tem muito potencial ainda.
> Fiz uma ferramenta que gera o calendário de posts de um mês inteiro pro nicho de [nicho] — Reels, carrossel, legendas prontas, **citando os serviços e preços de vocês**.
> Posso gerar o de [mês] da [nome do negócio] e te mandar pra ver? Sem compromisso."

**Versão B — Curiosidade:**
> "Boa tarde! Pergunta rápida: quanto tempo você gasta por semana pensando no que postar no Instagram da [nome]?"

### O Pitch Após Demo

1. Entra em `/admin/demo`, cadastra o perfil EXATO do negócio
2. Gera e baixa o PDF, manda pelo WhatsApp/DM
3. Espera a reação (~30s) e manda a oferta:

> "Isso foi gerado em segundos, citando os serviços de vocês. R$29,90/mês pra ter todo mês + chegando no seu zap todo dia. Menos que um corte.
> E olha: a gente nunca mexe na sua conta do Instagram — ela nunca desconecta nem é bloqueada. Quer o link? PIX ou cartão."

### Objeções e Respostas

| Objeção | Resposta |
|---------|---------|
| "Tá caro" | "É menos que um delivery. Se um post novo trouxer 1 cliente, já se pagou." |
| "Não sei se vou usar" | "Chega no seu zap todo dia às 8h, é só copiar e postar. 30 dias pra testar." |
| "Tenho que pensar" | "Claro. Mas R$29,90 é de lançamento — vou subir no mês que vem." |
| "Já tenho quem cuide" | "Manda o calendário pra ela então — vai economizar horas de planejamento." |
| "Já uso [mLabs/Etus]" | "Aquelas conectam na sua conta e bloqueiam/somem post. A gente não toca na sua conta — só te entrega o conteúdo pronto." |

---

## Sequência de Emails (Resend)

```
D+0   "Seu acesso está ativo. Cadastre seu negócio e gere seu primeiro calendário →"
D+3   "Qual tipo de post performa melhor no seu nicho?"
D+7   "Faltam 23 dias no mês — já gerou seu calendário?"
D+20  "Semana que vem é novo mês. Gere o de [próximo mês] →"
D+28  "Em uma palavra, como foi o RitmoPost este mês?" (NPS)
```

---

## Projeção Financeira

### Cenário Realista (12% churn, sem WhatsApp Bot)

| Mês | Novos | Churn | Clientes | MRR | Lucro |
|-----|-------|-------|----------|-----|-------|
| 1 | 20 | 0 | 20 | R$598 | ~R$568 |
| 3 | 20 | 5 | 53 | R$1.585 | ~R$1.555 |
| 12 | 20 | estabiliza | ~165 | R$4.934 | ~R$4.904 |

*12% churn mensal — teto natural sem retenção ativa ~165 clientes*

### Cenário Com WhatsApp Delivery (uso diário = retenção real)

| Mês | Clientes | MRR | Lucro |
|-----|----------|-----|-------|
| 6 | 200 | R$5.980 | ~R$5.950 |
| 12 | 450 | R$13.455 | ~R$13.425 |

*Churn estimado 4-6% com uso diário via WhatsApp — muda de ferramenta pra hábito.*

**Break-even: ~1 cliente** (paga a infra inteira, incluindo a VPS).

---

## Próximos Marcos

| Marco | Critério |
|-------|---------|
| **Primeira DM** | **20/06/2026 — trava de sócio** |
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
- ❌ Chamar a IA sem validar o JSON de retorno com Zod
- ❌ Alterar o prompt sem testar ao menos 5 nichos diferentes
- ❌ Mudar o formato do JSON de saída do calendário (quebra PDF, grid, WhatsApp)
- ❌ Conectar na conta de Instagram do cliente — **nunca.** É o diferencial.
- ❌ Deploy sem testar o fluxo completo de pagamento (modo teste do Stripe)
- ❌ Subir secrets para o repositório

---

*Última atualização: 2026-06-13 (madrugada, Claude autônomo) — Perfil do Negócio FECHADO na branch `feat/perfil-negocio`: migration aplicada no Neon, QA E2E completo passou (geração com perfil citando preços/bairro, regenerar dia, paywall, retrocompat de calendário órfão, admin/demo com perfil do prospect), dados de teste limpos. Pendente: Willian revisar a branch e mergear na main. Próximo: WhatsApp delivery (dias 4-5).*
