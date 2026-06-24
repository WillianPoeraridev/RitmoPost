# Cadência — Roadmap Completo do Produto

> **Sua autoridade tá grande. Seu feed, não. Cadência fecha esse buraco.**
> Este arquivo é o documento vivo do produto — leia antes de qualquer mudança não-trivial.

> ⚠️ **PIVOT (23/06/2026):** o produto deixou de ser ferramenta ampla/barata pra pequeno negócio e virou **Cadência** — high ticket, founder-led, vendido por DM pra **experts/mentores**. Posicionamento, narrativa, público e copy: ver **[PRODUTO.md](PRODUTO.md)** (fonte da verdade). Boa parte do histórico abaixo é da fase antiga (RitmoPost/barbearia/R$29,90) e está sendo migrada. As seções técnicas (stack, schema, prompt, carrossel) seguem válidas.

> ✅ **Domínio no ar (18/06/2026):** `ritmopost.com.br` (registro.br, NS `*.auto.dns.br`) ligado ao projeto Vercel `postaja` e resolvendo. Zona DNS publicada: `A @ → 76.76.21.21` + `CNAME www → cname.vercel-dns.com`. `https://ritmopost.com.br` responde HTTP 200 com SSL válido; `http://` faz 308 → HTTPS. O apex é o domínio canônico (bate com `BETTER_AUTH_URL`); `www` deve redirecionar pro apex (adicionar como domínio separado na Vercel, ainda pendente e não-bloqueante).

---

## 🔒 Sprint de Lançamento — trava de sócio

**Build total até 19/06/2026. Primeira DM dia 20/06/2026. Data travada — sem "só mais uma feature".**

7 dias de Claude Max é recurso que expira; usá-lo pra construir é racional. Mas a regra é: se dia 20 não sair DM, o problema nunca foi o produto.

| Dia | Foco | Status |
|-----|------|--------|
| **1** (12/06) | Fechar o free tier real (7 dias + PDF marca d'água) + rebrand RitmoPost + domínio | ✅ |
| **2-3** (13-14/06) | **Perfil do Negócio** — cadastro rico (serviços, preços, tom, bairro) injetado no prompt | ✅ **mergeado em produção** |
| **4-5** (15-16/06) | **WhatsApp delivery** — post do dia às 8h no zap, legenda pronta pra copiar (Evolution API) | 🟡 lado do app pronto e testado com mock — falta só a VPS (decisão do Willian) |
| **6** (17/06) | Qualidade — rodar geração nos 10 nichos com perfis fictícios reais, refinar prompts, validar Zod | ✅ relatório em `qa/2026-06-13-qualidade-10-nichos.md` |
| **7** (18-19/06) | QA do fluxo completo + gravar Reels da demo + montar lista de 50 leads no Instagram | ⏳ |
| **20/06** | **PRIMEIRA DM.** | 🎯 |

> 💡 **Além do plano original, entregue 15-17/06:** método **MoneyBranding** (cada post com pilar estratégico + story diário), **landing redesenhada** (Direção 4: dark + coral) e **tema coral aplicado no app inteiro**. Tudo em produção. Ver "Estado atual" abaixo.

---

## 📍 Estado atual (2026-06-17) — continuar de casa

**No ar em produção** (deploy manual via `vercel --prod`; o webhook GitHub→Vercel foi reconectado após o rename do repo POSTAJA→RitmoPost, então push em `main` volta a deployar sozinho):

- ✅ **Método MoneyBranding** — cada post tem `pillar` (atração/conexão/conversão) + `story` diário. Calendário virou um plano de 30 dias com ritmo. Validado nos 10 nichos (`qa/run-moneybranding-10.mts`). Único ajuste determinístico que cola via prompt: proibir conversão nos dias 1-5 (tamanho de legenda e refs locais são variância do haiku).
- ✅ **Landing nova + tema coral no app inteiro** — Direção 4: base `neutral` (era slate), acento coral `rose→orange` (era roxo), em UI, PDF e emails. Cores de tipo de post (Reels=violeta) e de pilar são taxonomia e foram preservadas.
- ✅ **Preço anual** ajustado pra **R$269/ano · "3 meses grátis"** na UI (era R$239). Coerência: R$29,90×9 = R$269,10.

**Pendências pra fechar de casa (em ordem):**
1. ~~**DNS** — adicionar o registro `A 76.76.21.21` (e `CNAME www → cname.vercel-dns.com`) no registro.br.~~ ✅ **Feito (18/06).** `ritmopost.com.br` abre com SSL. Falta só adicionar o `www` como domínio separado na Vercel com redirect 308 pro apex (não-bloqueante).
2. **Stripe** — ainda **não há conta Stripe nem assinantes**. Quando criar: criar o Price **anual de R$269** (Prices são imutáveis) e setar `STRIPE_PRICE_ID_YEARLY` na Vercel. A UI já mostra R$269.
3. **VPS do WhatsApp** (Hetzner) — subir Evolution, conectar número, setar `EVOLUTION_*` + `CRON_SECRET` na Vercel. Sem isso o cron diário só faz `skipped`.
4. **Dia 7** — QA do fluxo completo + gravar Reels da demo + lista de 50 leads.

---

## Visão

**Cadência** fecha o buraco entre a autoridade do expert e o conteúdo que ele entrega. Ele É referência — mas o feed dele não vende como uma. Cadência transforma a autoridade dele em conteúdo on-brand, na voz dele, postado todo dia como um império — sem ele criar nada.

O expert experimenta na entrada (R$47): 30 dias de conteúdo on-brand, na voz dele, prontos pra postar, na mão na hora. Depois sobe pra máquina (R$297/mês) que gera todo mês no automático. Detalhes de público, narrativa e escada em [PRODUTO.md](PRODUTO.md).

### Por Que Vende Rápido

A audiência já foi educada pelo Doug DeMarco e cia. — eles já sabem pensar como MoneyBrand. A dor não é entendimento, é **execução**: ciclo de venda curtíssimo. A entrada paga (R$47) over-entrega um resultado completo e pré-vende o R$297 (product-led, sem call). Somos nosso próprio case — a qualidade do produto é o vendedor.

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

## Precificação — escada de 2 degraus (self-service, sem call)

| Degrau | Preço | O que é |
|--------|-------|---------|
| **Entrada (tripwire)** | **R$47** (avulso) | 30 dias de conteúdo on-brand, na voz dele, prontos, AGORA. O resultado/"wow". Pago filtra comprador (não é trial grátis). Libera Pro por 35 dias. |
| **Cadência Pro (core)** | **R$297/mês** | A máquina: gera todo mês no automático, voz clonada, arte pronta, WhatsApp, regeração ilimitada. Onde mora o dinheiro. |

**Regra que não pode quebrar:** entrada = RESULTADO (1x), core = MÁQUINA (pra sempre). Não podem se sobrepor, senão a entrada canibaliza a escada. **R$1.497 setup done-for-you engavetado** até ter case. Racional completo em [PRODUTO.md](PRODUTO.md).

> O modelo antigo (Free 7 dias + Pro R$29,90/mês + Anual R$269) foi **substituído** pela escada acima. O free grátis morre: a entrada agora é paga (R$47) — pago qualifica comprador. O gating técnico (`isProUser`, 7 dias visíveis) é reaproveitado: R$47 libera Pro por 35 dias; quando expira, vira o gancho pro R$297.

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

// Estrutura do content (jsonb) — NÃO mudar o formato base:
[{
  day: 1,
  type: "Reels" | "Carrossel" | "Story" | "Feed",
  pillar?: "atracao" | "conexao" | "conversao",   // método MoneyBranding (opcional, jsonb = sem migration)
  theme: "Antes e Depois do Degradê",
  hook: "Esse corte mudou tudo 🔥",
  caption: "Transformação real aqui na Barbearia do Zé. Combo corte+barba R$50. Agende: [link]",
  hashtags: ["#barbearia", "#degradê", "#cortedecabelo"],
  story?: "Enquete: você chega de surpresa ou avisa no zap?"   // story diário (opcional)
}]
// pillar/story são opcionais: calendários antigos seguem abrindo. Pilar é normalizado
// no Zod (aceita "Atenção"/"Confiança"/etc.) pra nunca derrubar a geração.
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
STRIPE_PRICE_ID_ENTRY=    # ID do preço AVULSO R$47 (entrada/tripwire) no Stripe
STRIPE_PRICE_ID_MONTHLY=  # ID do plano RECORRENTE R$297/mês (Cadência Pro) no Stripe
STRIPE_PRICE_ID_YEARLY=   # legado (plano anual descontinuado) — opcional
RESEND_API_KEY=           # resend.com → API Keys
NEXT_PUBLIC_URL=          # URL pública (Vercel ou domínio)
ADMIN_SECRET=             # senha forte para /admin/demo
# WhatsApp delivery (dias 4-5)
EVOLUTION_API_URL=        # http://IP_DA_VPS:8080 (dev: http://localhost:8099 com qa/mock-evolution.cjs)
EVOLUTION_API_KEY=        # chave global da instância Evolution
EVOLUTION_INSTANCE=       # nome da instância conectada ao número
CRON_SECRET=              # Bearer do Vercel Cron → /api/cron/whatsapp-daily (openssl rand -hex 32)
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
- [x] Plano anual no Stripe (R$239/ano) — modal mensal/anual no upgrade, priceId resolvido server-side (com fallback de env). **Confirmar `STRIPE_PRICE_ID_YEARLY` na Vercel.**

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
- [ ] **WhatsApp delivery (dias 4-5)** — 🟡 **lado do app pronto na branch, testado E2E com mock**: colunas `whatsapp_number`/`whatsapp_opt_in` no user (migration aplicada), card de opt-in no dashboard (só Pro), `/api/whatsapp-settings`, client Evolution (`src/lib/evolution.ts`), cron `/api/cron/whatsapp-daily` (8h BRT via `vercel.json`, protegido por `CRON_SECRET`, fuso América/São_Paulo, pega o calendário mais recente do mês). Mock da Evolution em `qa/mock-evolution.cjs` + seed em `qa/seed-whatsapp-test.cjs`. **Falta (decisão/ação do Willian): contratar VPS Hetzner, subir Evolution via Docker, conectar o número, setar EVOLUTION_* e CRON_SECRET reais na Vercel.**
- [x] **Qualidade (dia 6)** — ✅ antecipado: 10 nichos gerados com perfis fictícios (Zod 10/10, promo citada 10/10, preços em 12-26 dias/30), 4 desvios sistemáticos achados e corrigidos no prompt (hashtags <6, legendas longas, poucos Reels, poucas refs locais), re-teste nos 5 piores nichos confirmou a melhora (legendas longas 23→2, hashtags <6 ~26→4 dias). Relatório completo: `qa/2026-06-13-qualidade-10-nichos.md`. Harness reutilizável em `qa/`.
- [ ] **QA + lançamento (dia 7)** — fluxo completo (cadastro → perfil → gerar → PDF → pagar → WhatsApp), Reels da demo, lista de 50 leads
- [x] **Sequência de emails D+3, D+7, D+20, D+28 + notificação D+25** — `src/lib/email.ts` (templates + layout compartilhado, welcome refatorado pra usar), cron `/api/cron/retention-emails` (12h UTC via `vercel.json`, `CRON_SECRET`), coluna `user.sent_emails` (migration aplicada) anti-reenvio, janela [dia, dia+2] que evita disparo retroativo pra cadastros antigos. Testado com dry-run (7 idades semeadas → marcos certos, dedupe e auth ok). **Entrega real depende do domínio verificado no Resend** (sandbox só envia pro dono da conta).

- [x] **Método MoneyBranding (15/06)** — cada post com pilar estratégico (atração/conexão/conversão) + story diário; calendário virou plano com ritmo. Prompt reescrito, campos opcionais no `CalendarDay`, surfaçado no grid/PDF/link público/WhatsApp. QA nos 10 nichos (`qa/run-moneybranding-10.mts`): pilares no alvo, story 30/30, sem regressão. Origem: `ref/moneybranding.txt` (d'demarco).
- [x] **Landing redesenhada + tema coral (15-16/06)** — Direção 4 (dark neutral + coral rose→orange) aplicada na landing e no app inteiro (UI, PDF, emails). Landing = página de confirmação pra comprador aquecido (curta, confiante, sem comparar/justificar). Hero split com preview + seção "como funciona" em steps. Preço anual → R$269/"3 meses grátis".

### Fase 3 — 90 a 180 Dias

- [ ] ~~Integração Meta Business Suite~~ — **MORTA por decisão estratégica.** Não integramos na conta do cliente: é o nosso diferencial defensivo. Nunca.
- [x] **Gerador de carrossel (motor)** — arte pronta pra postar via render determinístico (`next/og`/Satori), não difusão. Cor de marca (6 cores, iguais às do PDF) + tema dark/light, custo zero de token. Ver seção "Gerador de Carrossel" abaixo.
- [x] **Upload de logo (carrossel)** — Cloudflare R2: `PUT/DELETE /api/profiles/[id]/logo`, `LogoUpload` component, logo renderiza na capa e no CTA do carrossel (next/og busca a URL pública). Entregue 2026-06-23.
- [ ] **Persistir cor/tema no perfil** — hoje escolha por sessão. Coluna nova em `business_profiles` + ler na rota.
- [ ] **Gate Pro no carrossel** — botão "Gerar carrossel" hoje liberado pra qualquer logado.
- [ ] White-label para agências
- [ ] API pública

---

## Gerador de Carrossel (arte pronta pra postar) — 2026-06-22

O salto de "ideia em PDF" pra "post pronto em 30s". Hoje a IA entrega hook+legenda+hashtags; o dono ainda tinha que **montar** a arte (o 80% da dor). Agora o RitmoPost entrega o carrossel renderizado, on-brand.

### Decisão de arquitetura (por que NÃO usamos IA de imagem)

Render **determinístico** (`next/og` → Satori → PNG), não difusão. Pesquisa de modelos (Ideogram/Recraft/nano-banana/GPT-image) confirmou que difusão quebra em 4 pontos pro nosso caso: (1) consistência entre slides, (2) texto PT-BR legível, (3) cor de marca exata, (4) custo (~$0,05+/slide vs ~R$0). As ferramentas sérias (PostNitro, Predis) também usam template+brand-kit por baixo, não geram o slide com IA. **A IA já escreveu o conteúdo uma vez (na geração do calendário); o carrossel só desenha em cima — zero token, zero chamada de modelo.**

### O que está pronto (funcional ponta a ponta)

- **Motor** (`src/lib/carousel.tsx`): deriva os slides de um `CalendarDay` (capa → conteúdo → CTA, quebrando a legenda em frases; CTA detectado ou padrão por pilar). 3 templates JSX, 1080×1350 (4:5).
- **Cor de marca + tema**: `resolvePalette(color, theme)` deriva paleta inteira de 1 hex com **contraste garantido** (cor escura ou tema claro nunca saem ilegíveis). 6 cores iguais às do PDF + toggle dark/light. Sem color picker cru (protege a promessa "profissional").
- **Pilar virou rótulo**, não cor — no artefato público quem manda é a marca do cliente. A cor do pilar (MoneyBranding) segue no grid/PDF (planejamento).
- **Rota** `GET /api/carousel?id&day&slide&color&theme` (auth + dono) → PNG. Fontes Inter (woff latin) em `assets/fonts/`.
- **UI**: botão "Gerar carrossel" no `DayCard` → página `/calendario/[id]/carousel/[day]` com estúdio (`carousel-studio.tsx`): seletor de cor/tema ao vivo + grid + "Baixar todos" (`carousel-download.tsx`, baixa PNG por PNG na ordem).
- Verificado renderizando PNG real (dark/coral, light/coral, dark/navy, light/teal) — acentos PT-BR perfeitos, contraste OK em todos.

### O que falta (pra virar produto pro cliente — Passo 2)

- [ ] **Persistir cor/tema no perfil do negócio** — hoje é escolha por sessão (igual o PDF). Coluna nova em `business_profiles` + ler na rota, pra cada negócio "lembrar" a marca.
- [x] **Logo do cliente no slide** — Cloudflare R2 configurado (`ritmopost-logos`, public URL `pub-3231a0c7161d4ee9a0db21af3f784e45.r2.dev`), `aws4fetch` para signing S3-compat, logo renderiza na capa e no CTA via `next/og`. Env vars na Vercel. Entregue 2026-06-23.
- [ ] **Gate por plano Pro** no botão "Gerar carrossel" (hoje liberado pra qualquer logado — ok pra fase de case próprio).
- [ ] **Densidade de slides** (opcional): hoje 1 frase da legenda = 1 slide (3–5 no total). Carrossel de 7–10 slides com conteúdo de verdade exigiria **1** chamada de IA por carrossel pra expandir o tema (~R$0,001) — o único ponto que voltaria a custar token.
- [ ] Capa com imagem de fundo opcional (aí sim difusão via nano-banana no OpenRouter, ~$0,05) — só onde foto agrega.

## Arquitetura WhatsApp Delivery (dias 4-5)

**Onde roda a Evolution API:** ela precisa de processo persistente (WebSocket Baileys), que a Vercel não suporta.
**Decisão:** VPS própria (Hetzner CX22, ~R$28/mês) rodando Evolution via Docker — controle total = a tese "a gente nunca toca na sua conta" é 100% nossa.

> ⚠️ Risco residual: Evolution é não-oficial (Baileys); o número que pode ser banido é **o NOSSO**, não o do cliente — o que preserva o pitch. Mitigação: warm-up, volume baixo, opt-in. Graduar pra WhatsApp Cloud API oficial quando doer.

Cron diário (Vercel Cron ou Trigger) → busca posts do dia dos usuários Pro → POST para Evolution API → mensagem formatada no zap.

*(Arquitetura detalhada a ser fechada com o Willian após decisão de hosting.)*

---

## Estratégia de Vendas — DM founder-led pra experts

> A landing já vende a escada R$47 → R$297 self-service. A DM não vende a call — leva o expert pra entrada paga. Doutrina de copy (filtra, não convence) em [PRODUTO.md](PRODUTO.md).

### Perfil do Lead Ideal

- Expert/mentor/infoprodutor que vende oferta de alto ticket (mentoria/curso R$2k–50k)
- Instagram é o funil dele, mas o feed não condiz com o tamanho da oferta (posta solto/amador, ou some)
- Já consome conteúdo de método/posicionamento (linhagem Doug/MoneyBrand) → comprador aquecido
- Segundo mercado: arquitetos/designers de interiores

### Ângulo da DM — diagnóstico, não pitch

Não chega vendendo. Chega mostrando o buraco no funil dele (o diagnóstico do feed é a isca — feature-arma a construir). Copy curta e agressiva que filtra:

> "Sua autoridade tá grande. Seu feed, não. Vi o seu — [observação específica do buraco]. Fiz uma coisa que fecha isso."

O resto da conversa leva pro link da entrada (R$47). Quem entende o valor, compra; quem precisa de explicação, não é cliente.

### Objeções e Respostas

| Objeção | Resposta |
|---------|---------|
| "Tá caro" | (R$47 não gera essa objeção — é o ponto. Se vier no R$297:) "É uma fração do que você cobra numa mentoria. Um cliente que o feed te trouxer já pagou o ano." |
| "Já tenho social media" | "Quanto você paga e quão na sua voz tá saindo? Cadência é o método, na sua voz, no automático — não terceiriza a sua marca pra um estagiário." |
| "Eu mesmo posto" | "E quanto tempo seu (que vale caro) isso come? A entrada são 30 dias prontos por R$47. Testa." |
| "A IA não vai soar como eu" | "Por isso a entrada é paga e completa: você vê 30 dias na sua voz antes de assinar nada." |

---

## Sequência de Emails (Resend)

> ⚠️ Copy abaixo é da fase antiga (small biz). Precisa ser reescrita pra escada Cadência: D+0 ativa a entrada → wow dos 30 dias; sequência leva pra ascensão R$297 ("deixa no automático"). Pendente.

```
D+0   "Seus 30 dias estão prontos. Veja →"
D+3   "Já postou o primeiro? Veja como o feed muda quando tem método."
D+7   "Imagina isso todo mês, no automático, na sua voz."   → ascensão R$297
D+25  "Seu mês acaba em breve. Deixa no automático →"
```

---

## Projeção Financeira

> ⚠️ Projeção antiga assumia R$29,90/mês × volume de pequeno negócio. Com a escada Cadência a economia é outra — refazer. Nova lógica de unidade:

- **Entrada R$47** é acquisition que se paga (self-liquidating) — não é o lucro, é o filtro que qualifica comprador.
- **Core R$297/mês** é onde mora o MRR. **34 assinantes = R$10k/mês. ~280 = R$1M/ano.** Com ticket 10x o antigo, o jogo é poucos clientes certos, não volume.
- Custo de infra segue ~R$30/mês até centenas de clientes (ver "Custo de Manutenção"). **Margem ~99%, break-even ~1 cliente.**
- Meta do dono: faturar R$1M construindo marca forte e vendendo pra quem tem dinheiro e dor forte.

*Tabela detalhada (conversão entrada→core, churn) a refazer com dados das primeiras vendas.*

---

## Próximos Marcos

| Marco | Critério |
|-------|---------|
| **Primeira DM (Cadência)** | **24/06/2026** |
| 1ª entrada paga | 1 venda da entrada R$47 via DM |
| 1ª ascensão | 1 entrada vira assinante R$297/mês |
| 10 assinantes | R$2.970/mês MRR — escada validada |
| 34 assinantes | R$10k/mês |
| ~280 assinantes | R$1M/ano — a meta |

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

*Última atualização: 2026-06-23 (noite) — **PIVOT pra Cadência** (high ticket, experts, escada R$47→R$297): landing reescrita (copy de expert, visual premium, font Geist), checkout R$47 one-time codado (libera Pro 35 dias), posicionamento/narrativa/copy migrados pra [PRODUTO.md](PRODUTO.md), ROADMAP atualizado. Pendente: criar Prices no Stripe (R$47 avulso + R$297 recorrente) e setar envs; modal de ascensão → R$297; onboarding → linguagem de expert. — Anterior: **logo no R2** (Cloudflare R2 `ritmopost-logos`, upload/delete por perfil, logo na capa e CTA do carrossel via next/og, env vars na Vercel) + **UX do dashboard** (perfil inline no topo — zero cliques pra editar ou gerar; CTA "Criar perfil" para usuário sem perfil; link "Editar perfil" na página do calendário). Deploy em produção (`ritmopost.com.br`). Pendente do carrossel: persistir cor/tema no perfil, gate Pro. Anterior (2026-06-22): gerador de carrossel (render determinístico, cor de marca, dark/light). Pendente geral: (1) criar Stripe + Price anual R$269; (2) VPS Hetzner do WhatsApp; (3) QA fluxo completo + Reels demo + 50 leads.*
