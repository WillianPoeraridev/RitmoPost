# Cadência — Produto, Posicionamento e Narrativa

> **Cadência** é o nome da oferta. `RitmoPost`/`ritmopost.com.br` seguem como nome técnico do app e domínio (sem domínio novo por enquanto). Narrativa: "o RitmoPost cresceu e virou Cadência" — eleva o DNA "ritmo" sem trair.

> Pivot estratégico em 23/06/2026: de ferramenta ampla e barata (pequeno negócio, R$29,90) para **produto high ticket, founder-led, vendido por DM, com a copy/posicionamento como diferencial central.** Este arquivo é a fonte da verdade do posicionamento — leia antes de escrever qualquer copy.

---

## Público

**Cabeça de praia:** experts / mentores / infoprodutores high ticket — vendem mentoria/curso de R$2k–50k, o Instagram é 100% do funil deles, já compram educação e funil (ciclo de venda curto). O método de pilares é a língua nativa deles.

**Segundo mercado:** arquitetos & designers de interiores — projetos de R$30k–300k, negócio visual, motor on-brand brilha, público menos cético e menos concorrência.

**Eixo de público (vale mais que o nicho):** gente pra quem conteúdo é o funil de uma oferta de alto ticket, que odeia/não consegue produzir, e tem margem pra pagar. Corta fora criadores de conteúdo (conteúdo é o produto deles) e negócio local barato (sem margem nem dor).

---

## Posicionamento

### Somos um método, não uma ferramenta

Posicionar como "gerador" ou "ferramenta" cria churn — o cliente troca quando aparece algo mais barato. Método você incorpora. Referência você defende. O ativo já existe no produto: o método **Atração/Conexão/Conversão** está no código, nos posts, na UI. O software é a forma de acessar o método, não o produto.

**Regra de ouro:** o churn de ferramenta vem da pergunta *"existe algo mais barato?"*. O churn de método vem da pergunta *"consigo o mesmo resultado sem ele?"* — muito mais difícil de responder sim.

### A tese da transformação

> O expert **é** autoridade — mas o conteúdo dele não vende como uma.

Ele sabe pensar com método (aprendeu com Doug DeMarco e cia.). Mas *pensar não posta por ele.* Existe um buraco entre a autoridade que ele tem e o conteúdo que ele entrega. Esse buraco é onde mora o dinheiro.

- **DE:** autoridade travada, postando solto/amador, com um feed que não condiz com o tamanho da oferta.
- **PARA:** uma marca que publica todo dia como um império — conteúdo on-brand, estratégico, no automático, na voz dela.

**Frase de posicionamento (oficial):**
> "Sua autoridade tá grande. Seu feed, não. Cadência fecha esse buraco."

### Referência: Doug DeMarco (e como nos diferenciamos)

Doug faz R$21MM com mentoria/consultoria sobre o conceito "MoneyBrand" (o nosso método MoneyBranding vem dessa linhagem). **Doug vende o cérebro (método) e é raso de propósito em ferramenta.** O moat da Cadência é vender **cérebro + mãos** — a máquina que executa o MoneyBrand todo dia. A audiência já educada pelo Doug é a nossa: dor de **execução**, não de entendimento → ciclo de venda curto.

"Roubar como artista" = assimilar o DNA de oferta/posicionamento e transformar. **Nunca** fotocopiar copy/marca dele (vira cover). Narrativa e nome são nossos.

### vs concorrentes diretos

ZenPost (R$37/mês, 17k clientes) e BestContent são **o mesmo produto commodity**: "IA cria conteúdo rápido, pra todos, barato, self-serve". Jogo de volume e preço que um dev sozinho não ganha. **Cadência é o oposto:** premium, com método, pra um nicho, founder-led. É aí que mora o diferencial.

### Diferencial defensivo: nunca tocamos na conta do cliente

A gente não conecta no Instagram de ninguém — entrega o conteúdo pronto, o cliente posta. Os concorrentes que agendam pela API da Meta quebram (conta bloqueada, post que some). A "fraqueza" de não agendar é o diferencial. **Não integramos com a Meta. Nunca.**

---

## A escada de oferta (self-service, SEM call)

Modelo Doug: sem call, sem funcionário, produto é o maior case. **A entrada paga faz o trabalho que a call faria — escalável.**

| Degrau | Preço | O que é | Papel |
|--------|-------|---------|-------|
| **Entrada (tripwire)** | **R$47** (avulso) | 30 dias de conteúdo on-brand, na voz dele, prontos, AGORA | O **resultado**. O "wow". Pago filtra comprador (não é trial grátis). Se paga (acquisition). |
| **Cadência Pro (core)** | **R$297/mês** | A máquina: gera todo mês no automático, voz clonada, arte pronta, entrega no WhatsApp, regeração ilimitada | A **máquina**. Onde mora o dinheiro. "Você viu 1 mês, assina e nunca mais pensa nisso." |

**Regra que não pode quebrar:** entrada entrega um RESULTADO (1x, na mão); core entrega a MÁQUINA (pra sempre, automático, mais fundo). **Não podem se sobrepor** — senão a entrada canibaliza a escada.

**R$1.497 setup (done-for-you) está engavetado** — vira tier premium só depois de ter case. Não construir escada de 3 degraus antes do 1º cliente.

Implementação técnica: R$47 = pagamento único Stripe (`mode: payment`) que libera Pro por 35 dias; quando expira, `isProUser` cai sozinho e vira o gancho pro R$297/mês.

---

## Doutrina de copy

**High ticket não convence. FILTRA.** Frase curta e agressiva é mecanismo, não estilo: o comprador certo se reconhece, o errado se afasta sozinho. Status vende caro. Quem precisa de explicação não é cliente.

### O que NÃO fazer
- **Não explicar, não comparar, não justificar preço.** Quem é bom não precisa provar.
- **Nunca mencionar "IA"** em lugar nenhum. A IA é o motor (como a injeção eletrônica do carro), não o produto. A pessoa compra resultado, voz, consistência — não tecnologia.
- **Não listar feature onde cabe status.** No checkout o cara já decidiu pagar — reforça a transformação, não enumera item.

### O que funciona
- Frases curtas e agressivas que filtram ("continua aí brincando de Instagram").
- Falar de **autoridade vs feed** — o buraco que a Cadência fecha.
- Falar de **resultado e voz** ("na sua voz", "no automático", "você não cria nada").
- **Cadência feita com Cadência** — somos nosso próprio case. Substitui depoimento e call.
- **Restrição visual = premium.** Quase-mono (preto/grafite + off-white), coral só como acento cirúrgico, respiro, tipografia com contraste de peso.

---

## Estado do produto vs narrativa (follow-ups)

O motor já entrega 30 dias com método + carrossel on-brand + logo no slide — é reposicionar, não reconstruir.

- [x] **Checkout R$47** — `mode: "payment"` no Stripe, price setado, webhook distingue payment vs subscription.
- [x] **Modal de ascensão** (`upgrade-button.tsx`) — simplificado: um botão direto pro R$297/mês, sem modal de comparação.
- [x] **Onboarding / perfil** — reescrito pra linguagem de expert: "voz, método, ofertas", bairro removido, sugestões de nicho expert.
- [x] **Marca Cadência** — 100% do app (navs, forms, copy, CTAs) fala Cadência. Zero "RitmoPost" visível ao usuário.
- [ ] **Features-arma** (próxima sprint): voz da marca clonada, repurposing 1→semana, diagnóstico de Instagram (isca de DM), CTA orientado à oferta high ticket.
- [ ] **Stripe produção**: criar prices em live mode, setar vars no Vercel, verificar conta.
