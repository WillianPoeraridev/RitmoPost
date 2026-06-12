# PostaJá — Fluxo de Trabalho em Equipe

> Cole este arquivo no contexto da sua LLM antes de começar a codar.
> Pré-requisito: você já rodou `git checkout main && git pull`.

---

## Regras Inegociáveis

- Nunca commitar direto na `main`
- Todo código entra via Pull Request
- O outro dev revisa antes de mergear
- Conventional Commits obrigatório (veja abaixo)

---

## Passo a Passo

### 1. Criar branch para a feature ou fix

```bash
git checkout -b feat/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

Exemplos reais:
```bash
git checkout -b feat/mes-selecionavel
git checkout -b fix/paywall-nao-bloqueando
git checkout -b chore/atualizar-deps
```

### 2. Codar e commitar ao longo do trabalho

Commita por partes — não tudo no final:
```bash
git add src/caminho/do/arquivo.tsx
git commit -m "feat: adiciona seletor de mes no formulario"
```

### 3. Subir a branch

```bash
git push origin feat/nome-da-feature
```

### 4. Abrir Pull Request no GitHub

- Acesse github.com/WillianPoeraridev/POSTAJA
- Clique em "Compare & pull request"
- Título: mesmo padrão do commit (`feat: ...`)
- Descrição: o que foi feito e como testar
- Abra o PR

### 5. Revisão

- O outro dev lê, comenta se necessário
- Após aprovação: clica **Merge pull request**
- A Vercel faz o deploy automaticamente

### 6. Após o merge — ambos atualizam

```bash
git checkout main
git pull
```

---

## Conventional Commits

| Prefixo | Quando usar |
|---------|-------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `chore:` | Config, deps, scripts |
| `docs:` | Documentação |
| `refactor:` | Refatoração sem mudar comportamento |
| `style:` | CSS, formatação |

---

## Stack Resumida (para contexto da LLM)

```
Next.js 16 (App Router) + TypeScript strict
Neon PostgreSQL + Drizzle ORM
Better Auth (email + senha)
OpenRouter API — modelo: anthropic/claude-haiku-4-5
@react-pdf/renderer
Stripe (pagamentos)
Resend (emails)
Vercel (deploy automático no merge na main)
```

## Comandos Úteis

```bash
npm run dev          # dev local
npm run db:push      # aplica schema no Neon
npm run db:studio    # visualiza o banco
npm run build        # testa o build antes do PR
```

---

## O Que a LLM Deve Seguir

- TypeScript strict — zero `any` sem justificativa
- Zod em toda entrada de dados externa
- Componentes em `src/components/`, lógica em `src/lib/`
- Erros para o usuário em pt-BR, logs em inglês
- Não adicionar feature sem o Willian aprovar no PR
