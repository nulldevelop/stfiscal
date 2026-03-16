# ST Fiscalização e Relatórios

> Sistema web para fiscalização de contratos públicos, geração de relatórios e gestão de notificações — voltado a órgãos e entidades governamentais.

---

## 📌 Descrição

O **ST Fiscalização** é uma plataforma corporativa de fiscalização contratual desenvolvida para suportar o ciclo completo de acompanhamento de contratos públicos. O sistema permite que fiscais, gestores e administradores registrem relatórios de fiscalização, emitam notificações de conformidade, troquem mensagens internas, gerem documentos em PDF com assinatura digital e sincronizem automaticamente dados de contratos e licitações com sistemas externos (API OXY).

O objetivo é centralizar e padronizar o processo de fiscalização contratual, reduzindo retrabalho, garantindo rastreabilidade e aumentando a conformidade com a legislação de compras públicas.

---

## 🚀 Funcionalidades

- **Gestão de contratos e licitações** — acompanhamento de situação, aditivos e empenhos
- **Relatórios de fiscalização** — suporte a múltiplos tipos: Bens e Serviços, Transporte, Obras, Terceirização e Fiscal Principal
- **Geração de PDF** — relatórios com assinatura digital, exportáveis diretamente pelo sistema
- **Notificações** — emissão e histórico de notificações de desconformidade, entrega e trabalhistas
- **Mensagens internas** — comunicação entre fiscais, gestores e administradores com histórico de respostas
- **Controle de acesso por papel (RBAC)** — 7 perfis de acesso com permissões granulares por módulo
- **Multi-organização** — isolamento de dados por organização
- **Sincronização automática** — cron jobs para importar contratos, licitações e empenhos via API externa
- **Envio de e-mails** — notificações automáticas por SMTP com suporte a configuração por organização
- **Autenticação via OAuth** — Microsoft (Entra ID) e Google, além de login por credenciais e LDAP
- **Auditoria** — registro de todas as ações críticas do sistema (criar, alterar, excluir)

---

## 🛠️ Tecnologias e Stack

### Frontend
| Tecnologia | Versão |
|---|---|
| [Next.js](https://nextjs.org/) | 15.x (App Router) |
| [React](https://react.dev/) | 19.x |
| [TypeScript](https://www.typescriptlang.org/) | 5.x |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x |
| [shadcn/ui](https://ui.shadcn.com/) + Radix UI | — |
| [React Hook Form](https://react-hook-form.com/) + Zod | 7.x / 4.x |
| [TanStack Table](https://tanstack.com/table) | 8.x |
| [TanStack Query](https://tanstack.com/query) | 5.x |
| [React PDF Renderer](https://react-pdf.org/) | 4.x |
| [date-fns](https://date-fns.org/) | 4.x |
| [Sonner](https://sonner.emilkowal.ski/) | 2.x |

### Backend / Runtime
| Tecnologia | Descrição |
|---|---|
| Next.js API Routes | Endpoints REST (App Router) |
| [Better Auth](https://www.better-auth.com/) | Autenticação (credenciais, OAuth, LDAP) |
| [Prisma ORM](https://www.prisma.io/) | Acesso ao banco de dados |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados principal |
| [Nodemailer](https://nodemailer.com/) | Envio de e-mails via SMTP |
| [node-cron](https://www.npmjs.com/package/node-cron) | Tarefas agendadas (sync, e-mails) |
| [ldapjs](https://ldapjs.org/) | Autenticação LDAP legada |
| Node.js + IISNode | Servidor customizado para hospedagem IIS |

### Ferramentas de Desenvolvimento
| Tecnologia | Descrição |
|---|---|
| [Biome](https://biomejs.dev/) | Lint e formatação (substitui ESLint + Prettier) |
| [Vitest](https://vitest.dev/) | Testes unitários e de componentes |
| [pnpm](https://pnpm.io/) | Gerenciador de pacotes |

---

## 📷 Demonstração / Screenshots

![Dashboard Fiscal](public/screenshots/dashboard-fiscal.png)
![Relatório de Fiscalização](public/screenshots/relatorio.png)
![Notificações](public/screenshots/notificacoes.png)

---

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/installation) v9+
- [PostgreSQL](https://www.postgresql.org/) 15+

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/sua-org/stfiscal.git
cd stfiscal

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Gere o client do Prisma
pnpm exec prisma generate

# 5. Execute as migrations do banco de dados
pnpm exec prisma migrate dev

# 6. (Opcional) Popule o banco com dados iniciais
pnpm exec prisma db seed
```

### Execução

```bash
# Modo desenvolvimento
pnpm run dev
# Acesse: http://localhost:3000

# Build de produção
pnpm run build
pnpm run start
# Servidor inicia na porta 82 (configurável em server.js)
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# ─── Banco de Dados ────────────────────────────────────────
DATABASE_URL="postgresql://usuario:senha@localhost:5432/stfiscal"

# ─── Aplicação ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ─── Autenticação (Better Auth) ────────────────────────────
BETTER_AUTH_SECRET="sua-chave-secreta-aqui"
BETTER_AUTH_URL="http://localhost:3000"

# ─── OAuth Microsoft (Entra ID) ────────────────────────────
MICROSOFT_CLIENT_ID="seu-client-id"
MICROSOFT_CLIENT_SECRET="seu-client-secret"
MICROSOFT_TENANT_ID="seu-tenant-id"

# ─── OAuth Google ──────────────────────────────────────────
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"

# ─── E-mail (SMTP) ─────────────────────────────────────────
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT="587"
SMTP_USER="noreply@exemplo.com"
SMTP_PASS="sua-senha-smtp"
SMTP_FROM="noreply@exemplo.com"
SMTP_SECURE="false"

# ─── API Externa (Sistema OXY) ─────────────────────────────
OXY_API_URL="https://api.oxy.exemplo.gov.br"
OXY_API_KEY="sua-chave-api"
```

---

## 🧪 Testes

O projeto utiliza [Vitest](https://vitest.dev/) com React Testing Library.

```bash
# Executar todos os testes
pnpm run test

# Modo watch (re-executa ao salvar)
pnpm run test:watch

# Interface visual do Vitest
pnpm run test:ui

# Cobertura de código
pnpm run coverage

# Servir relatório de cobertura localmente
pnpm run serve:coverage
```

Arquivos de teste devem seguir o padrão:
```
src/**/*.test.ts
src/**/*.test.tsx
src/**/*.spec.ts
src/**/*.spec.tsx
```

---

## 📦 Estrutura do projeto

```
stfiscal/
├── src/
│   ├── app/
│   │   ├── (public)/              # Páginas públicas (login, cadastro, redefinição de senha)
│   │   ├── (auth)/                # Rotas protegidas (requerem autenticação)
│   │   │   ├── dashboard-fiscal/  # Dashboard do fiscal (contratos, relatórios, notificações)
│   │   │   ├── dashboard-gestor/  # Dashboard do gestor de contratos
│   │   │   └── dashboard-owner/   # Dashboard do administrador/owner
│   │   └── api/
│   │       ├── auth/              # Handlers Better Auth
│   │       ├── cron/              # Endpoints de sincronização e envio de e-mails
│   │       ├── fiscais/           # Endpoints de fiscais
│   │       ├── reports/           # Geração de relatórios
│   │       └── notifications/     # Notificações
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   ├── kibo-ui/               # Componentes do registry Kibo UI
│   │   └── shared/                # Providers, tema global
│   ├── lib/
│   │   ├── auth.ts                # Configuração Better Auth
│   │   ├── prisma.ts              # Singleton do Prisma Client
│   │   ├── permissions/           # RBAC — verificação de permissões
│   │   ├── email/                 # Serviço de e-mail (Nodemailer)
│   │   ├── cron/                  # Agendador de tarefas (node-cron)
│   │   └── sync/                  # Integração com API OXY
│   └── utils/                     # Formatadores (CPF, CNPJ, datas, telefones), templates PDF
├── prisma/
│   ├── schema.prisma              # Modelo de dados completo (32 entidades)
│   ├── migrations/                # Histórico de migrations
│   └── seed.ts                    # Script de seed inicial
├── public/                        # Assets estáticos
├── server.js                      # Servidor customizado (IISNode)
├── web.config                     # Configuração IIS (Windows)
├── next.config.ts                 # Configuração Next.js
├── biome.json                     # Configuração Biome (lint/format)
└── components.json                # Configuração shadcn/ui
```

### Principais perfis de acesso (Roles)

| Role | Descrição |
|---|---|
| `OWNER` | Administrador total da organização |
| `ADMIN` | Administrador com permissões amplas |
| `SUPORT` | Suporte técnico interno |
| `FISCAL_PRINCIPAL` | Fiscal principal do contrato |
| `FISCAL_SETORIAL` | Fiscal setorial do contrato |
| `GESTOR_CONTRATOS` | Gestor de contratos |
| `USER` | Usuário com acesso básico |

---

## 📌 Roadmap / Melhorias futuras

- [ ] Painel de analytics e dashboards com gráficos de indicadores
- [ ] Exportação de relatórios em formato Excel/CSV
- [ ] Integração com mais sistemas externos (SIAFI, SIASG, etc.)
- [ ] Aplicativo mobile (PWA ou React Native)
- [ ] Assinatura digital com certificado ICP-Brasil
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Notificações em tempo real via WebSocket
- [ ] Testes de integração com banco de dados real (Vitest + Prisma)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um **fork** do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Realize as alterações seguindo o padrão de código ([Biome](https://biomejs.dev/))
4. Verifique a formatação: `pnpm exec biome check --write .`
5. Faça o commit: `git commit -m 'feat: adiciona minha feature'`
6. Envie para o fork: `git push origin feature/minha-feature`
7. Abra um **Pull Request**

### Padrões do projeto

- **Commits**: seguir [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- **Formatação**: Biome (sem ponto e vírgula, aspas simples)
- **Tipagem**: TypeScript estrito — sem `any` implícito
- **Componentes**: Preferir Server Components; usar Client Components apenas quando necessário

---

## 📄 Licença

© 2026 ST Fiscalização e Relatórios. Todos os direitos reservados.

Este software é proprietário e confidencial. É proibida a reprodução, distribuição, modificação ou uso, total ou parcial, sem autorização prévia e expressa do titular dos direitos.

---

> Desenvolvido para modernizar e padronizar a fiscalização de contratos públicos.
