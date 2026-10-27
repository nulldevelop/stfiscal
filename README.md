# ST Fiscalização e Relatórios

> Plataforma de fiscalização de contratos públicos, relatórios e notificações.

| | |
|---|---|
| **Tipo** | Sistema para órgão público · multi-organização |
| **Cliente** | Prefeitura de Campina Grande do Sul |
| **Meu papel** | Desenvolvedor Full Stack (time de desenvolvimento) |

## Sobre o projeto

Dá suporte ao ciclo completo de acompanhamento de contratos públicos: fiscais, gestores e administradores registram a fiscalização, emitem notificações e geram relatórios, com rastreabilidade e aderência à legislação de compras públicas.

## Contexto

Projeto desenvolvido para a **Prefeitura de Campina Grande do Sul**, em contrato como **Desenvolvedor Full Stack**, integrando o time de desenvolvimento responsável pelos sistemas internos da prefeitura. Minha atuação cobre front-end, back-end, modelagem de banco de dados e integrações. O código pertence ao contratante; este repositório documenta minha participação.

## Funcionalidades

- Contratos, licitações, aditivos e empenhos
- Relatórios de fiscalização: bens e serviços, transporte, obras, terceirização e fiscal principal
- Geração de PDF com assinatura digital
- Notificações de desconformidade, entrega e trabalhistas, com histórico
- Mensagens internas entre fiscais, gestores e administradores
- Controle de acesso por papel (RBAC), com permissões por módulo
- Sincronização automática de contratos, licitações e empenhos via API externa (cron)
- Login por credenciais, Microsoft (Entra ID), Google e LDAP
- Envio de e-mails por SMTP e auditoria das ações críticas

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL · Better Auth · TanStack Query / Table · React PDF · node-cron · ldapjs · Nodemailer · Vitest · Biome

## Como rodar

Pré-requisitos: Node.js 20+, pnpm e o banco de dados indicado na stack.

```bash
pnpm install
cp .env.example .env   # ou crie o .env com as variáveis abaixo
pnpm prisma migrate dev
pnpm dev
```

A aplicação sobe em `http://localhost:3000`.

## Variáveis de ambiente

Banco (DATABASE_URL), autenticação (BETTER_AUTH_*), provedores OAuth, LDAP e SMTP. Os nomes exatos estão em src/lib.

## Autor

**Pedro Andrade** — Desenvolvedor Full Stack · [null.dev](https://nulldev.com.br) · [LinkedIn](https://linkedin.com/in/pedrodevfull) · [GitHub](https://github.com/nulldevelop)