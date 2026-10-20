# ST Fiscalização e Relatórios

> Plataforma web multi-tenant para fiscalização de contratos públicos, com relatórios assinados digitalmente, notificações de conformidade, mensagens internas e sincronização automática com o portal de transparência OXY/Elotech.

[**Repositório**](https://github.com/devpedroA/stfiscal)

![Dashboard do fiscal](../../stfiscal/public/screenshots/dashboard-fiscal.png)

<!-- Capturas de tela reais do repositório (public/screenshots). -->

## Sobre o projeto

Órgãos públicos precisam acompanhar a execução contratual (obras, serviços, terceirização, fornecimento de bens) com registro formal de inspeções, cobranças a fornecedores e evidência auditável do que foi feito por cada fiscal. O **ST Fiscalização e Relatórios** resolve isso centralizando o ciclo completo: cadastro de contratos/licitações/empresas, registro de relatórios por tipo, emissão de notificações de descumprimento, comunicação interna e trilha de auditoria.

O público-alvo são **fiscais** (registram relatórios e notificações no campo), **gestores de contratos** (importam e acompanham contratos, licitações e aditivos) e **administradores** (configuram permissões, SMTP, formulários dinâmicos e logs), em modelo multi-organização.

O principal diferencial técnico é a **sincronização automática** (cron + endpoints HTTP protegidos) com a API pública do portal de transparência OXY/Elotech — contratos, licitações, fiscais, aditivos e empenhos são importados por pipeline em etapas (fetch → classificação → transação) com log por organização — somada a geração de PDFs via React PDF com código único de assinatura digital e página pública de verificação com QR code.

## Funcionalidades

- [x] Autenticação e-Senha (Better Auth) com e-mail/senha e OAuth Microsoft (Entra ID) e Google; reset de senha por e-mail.
- [x] Multi-tenancy por organização com RBAC de 7 papéis (OWNER, ADMIN, SUPORT, FISCAL_PRINCIPAL, FISCAL_SETORIAL, GESTOR_CONTRATOS, USER) aplicado no middleware e por módulo (permissões CRUD).
- [x] Dashboard do fiscal: visão de contratos, 5 tipos de relatório (bens e serviços, transporte de serviços, obras, terceirização, fiscal principal) com rascunho/finalização, 4 tipos de notificação (falta atrasada/entrega, entrega incompleta, desconformidade, fiscal trabalhista), histórico e mensagens internas.
- [x] Dashboard do gestor: contratos (com importação), licitações, empresas, fiscais, aditivos, notificações, mensagens e relatórios.
- [x] Dashboard do admin (owner): configurações da organização (SMTP e URLs de API por org), matriz de permissões, módulos, configuração dinâmica de formulários, logs de auditoria, changelog e configuração de relatórios vencidos.
- [x] Sincronização via cron (node-cron na instrumentação do Next): contratos/licitações/fiscais/aditivos (03h), empenhos (04h), e-mails de relatórios pendentes > 30 dias (dias úteis 08h), todos também acionáveis via HTTP com `CRON_SECRET`.
- [x] Geração de PDFs por tipo de relatório/notificação com código de assinatura digital, armazenamento em disco e verificação pública (`/verify-report/[id]` com QR).
- [x] Mensagens internas com destinatários e respostas; trilha de auditoria (CREATE/UPDATE/DELETE com snapshots).
- [ ] Dashboards analíticos e exportação Excel/CSV.
- [ ] Integração ICP-Brasil para assinatura digital qualificada (hoje: código único + QR).
- [ ] Testes de integração em banco dedicado (harness Vitest configurado, sem testes escritos ainda).

> LDAP aparece como dependência no `package.json`, mas não há implementação no código — trate como planejado, não como funcionalidade.

## Tecnologias

- **Frontend:** Next.js 15 (App Router, RSC), React 19, Tailwind CSS 4, shadcn/ui + Radix + Kibo UI, TanStack Table e TanStack Query, React Hook Form + Zod, React PDF Renderer, lucide/tabler icons, sonner, next-themes.
- **Backend:** Next.js API Routes + Server Actions (sem servidor separado), Better Auth 1.3 (plugins de organização e username), Nodemailer (SMTP), node-cron via `src/instrumentation.ts`.
- **Banco de dados:** PostgreSQL com Prisma ORM 7 (driver adapter `@prisma/adapter-pg`, cliente gerado em `src/generated/prisma`, 44 models).
- **Infraestrutura:** hospedagem em produção via IIS + IISNode no Windows (`web.config` + `server.js` customizado, porta padrão 82); deploy automatizado por GitHub Actions (self-hosted runner Windows) que builda e publica em `C:\inet\wwwroot\sira`.
- **Testes:** Vitest 4 + Testing Library + jsdom + cobertura V8 configurados no `package.json` (ainda sem arquivos de teste).
- **Qualidade de código:** Biome 2.3, TypeScript 5 estrito.

## Arquitetura

Aplicação full-stack única no Next.js App Router. O front consome Server Actions (mutações com sessão, organização e `MemberPermission`) e Route Handlers (`/api/auth`, `/api/cron/*`, `/api/reports`, `/api/notifications`, mensagens e file-serving).

Três painéis protegidos por middleware (sessão + organização + papel) e por matriz de permissões em `src/lib/permissions/`:

```
src/app/(auth)/
├── dashboard-fiscal/    # inspetor: relatórios, notificações, mensagens, rascunhos
├── dashboard-gestor/    # gestão de contratos, licitações, empresas, fiscais, aditivos
└── dashboard-owner/     # admin: settings, permissões, módulos, forms dinâmicos, logs
```

Cada feature segue o padrão de colocation `_actions` / `_data-access` / `_components`.

Fluxo de sincronização OXY (por organização — URLs da API ficam **no banco**, em `Organization.apiUrl*`, não em variáveis de ambiente):

```
cron (node-cron) ou HTTP (CRON_SECRET)
  → steps: fetch paginado → classificação → transação única
  → registro em ApiSyncLog
```

Decisões importantes:

- **RBAC duplo**: middleware bloqueia rotas por papel; módulo de permissões (`MemberPermission` × `Modulo`) controla CRUD por módulo dentro do painel.
- **Bootstrap de papéis por e-mail**: `resolveMemberRole()` atribui o papel inicial a partir de listas separadas por vírgula em variáveis de ambiente; padrão é `FISCAL_SETORIAL`.
- **SMTP por organização**: configuração de e-mail fica no banco (com fallback para env), permitindo um SMTP por tenant.
- **PDF e anexos em disco local** (`REPORTS_DIR`, `NOTIFICATION_DIR`, `ATTACHMENTS_DIR`) — exige disco persistente no host.
- **Auditoria** com snapshots before/after em todas as mutações relevantes.

## Pré-requisitos

- Node.js 20+ (o CI usa 24.13.0)
- pnpm 10+ (CI fixa 10.28.1)
- PostgreSQL 15+
- Servidor SMTP (obrigatório para reset de senha e e-mails de relatórios pendentes)
- Opcional: apps OAuth no Microsoft Entra ID e Google
- Produção: Windows com IIS + IISNode (desenvolvimento local não precisa)

## Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/devpedroA/stfiscal.git
cd stfiscal
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz (não há `.env.example` no repositório) e preencha os valores necessários.

```env
DATABASE_URL=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
LINK_URL=
PORT=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_SECURE=
CRON_SECRET=
OWNER_EMAILS=
ADMIN_EMAILS=
GESTOR_EMAILS=
FISCAL_PRINCIPAL_EMAILS=
FISCAL_SETORIAL_EMAILS=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
REPORTS_DIR=
NOTIFICATION_DIR=
ATTACHMENTS_DIR=
```

Inclua somente as variáveis que o projeto realmente utiliza. Nunca publique credenciais reais.

Observações:

- As URLs das APIs OXY são configuradas **por organização no banco** (dashboard do owner), não via env.
- `*_EMAILS` são listas separadas por vírgula usadas no cadastro para atribuir o papel inicial do usuário.
- OAuth Microsoft/Google são opcionais; sem eles, use e-mail/senha.
- `DATABASE_CONNECTION_LIMIT` é opcional (padrão 10).

### 4. Prepare o banco de dados

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

O seed cria a organização inicial (município de Campina Grande do Sul/PR), módulos, permissões e dados de suporte.

### 5. Inicie a aplicação

```bash
pnpm dev
```

A aplicação sobre em `http://localhost:3000`. Em produção o caminho é `node server.js` (porta `PORT` ou 82) hospedado no IIS via IISNode.

> Comandos úteis: `pnpm build`, `pnpm start`, `pnpm exec biome check --write .`, `pnpm exec tsx prisma/seed-form-config.ts` (seed opcional de campos dinâmicos de formulário, não incluído no `prisma db seed`).

## Testes

O harness de testes está configurado (Vitest 4, Testing Library, jsdom, cobertura V8), mas ainda não há arquivos de teste nem `vitest.config` dedicado. Quando existirem:

```bash
pnpm run test
pnpm run test:watch
pnpm run test:ui
pnpm run coverage
```

Áreas prioritárias para cobertura: pipeline de sincronização OXY (`src/lib/sync/`), camada de permissões, server actions de relatórios/notificações e geração de PDFs.

## Decisões técnicas

- **Sincronização multi-tenant por configuração no banco**: URLs da API OXY ficam em `Organization`, permitindo apontar cada prefeitura para o seu portal sem redeploy; chamadas são públicas (sem API key), com paginação e log em `ApiSyncLog`.
- **Pipeline em etapas (fetch → classify → transaction)**: separa a obtenção dos dados da escrita, permitindo reprocessamento e falhas parciais auditáveis.
- **RBAC em duas camadas** (rota no middleware + CRUD por módulo): evita que um fiscal com acesso a um módulo consiga operar além do papel dele.
- **PDFs gerados no servidor com React PDF** e assinatura por código único + QR, em vez de depender de serviço externo — verificação pública sem autenticação.
- **Cron in-process** (`node-cron` na `instrumentation.ts`) com espelho em endpoints HTTP protegidos por `CRON_SECRET`, viabilizando gatilhos externos (ex.: agendador do Windows) além do scheduler embutido.
- **Hospedagem IIS/IISNode** com `server.js` customizado: resultado do ambiente do órgão público (Windows), ainda que o `@vercel/analytics` esteja presente no layout.

## Limitações conhecidas

- PDFs e anexos em disco local — não compatível com hosts serverless sem migrar para storage de objetos.
- Testes automatizados: harness pronto, zero testes escritos; sem CI de testes (o workflow só faz build + deploy IIS).
- LDAP: dependência presente no `package.json`, sem implementação no código.
- O workflow de deploy copia `.next/standalone`, mas `next.config.ts` não define `output: 'standalone'` — verificar se o build standalone está sendo gerado como esperado.
- Assinatura digital é por código único + QR, sem PKI/ICP-Brasil.
- Exportações (Excel/CSV) e dashboards analíticos ainda não implementados.
- Sem licença aberta (software proprietário).

## Contribuição

Projeto interno/proprietário; contribuições externas não são aceitas no momento. Fluxo interno: Conventional Commits, lint/format com Biome (`pnpm exec biome check --write .`), PRs para `main` disparam o deploy via GitHub Actions.

## Licença

Software proprietário e confidencial. © 2026 ST Fiscalização e Relatórios. Todos os direitos reservados. Não há arquivo de licença aberta no repositório; qualquer uso, cópia ou distribuição depende de autorização prévia.

## Autor

**Pedro Andrade (devpedroA)**

- GitHub: https://github.com/devpedroA
