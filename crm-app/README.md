# CRM

Sistema de relacionamento com clientes para uso interno: contatos, empresas,
funil de negócios (Kanban), histórico de atividades e tarefas.

Feito com Next.js 16 (React + TypeScript), PostgreSQL, Prisma 6 e Tailwind CSS.

## Como rodar

Pré-requisitos: Node.js 20 ou mais novo e PostgreSQL rodando.

1. Instale as dependências:

   ```powershell
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `SESSION_SECRET`
   (o próprio arquivo explica como gerar a chave).

3. Crie as tabelas no banco:

   ```powershell
   npx prisma migrate dev
   ```

4. Inicie o servidor:

   ```powershell
   npm run dev
   ```

5. Abra http://localhost:3000. Na primeira vez, aparece a tela
   "Primeiro acesso" para criar seu usuário.

> **Windows:** se o PowerShell disser que "a execução de scripts foi
> desabilitada", use `npm.cmd` no lugar de `npm` (ex.: `npm.cmd run dev`).

## Publicar na internet (Vercel + Neon)

1. Crie um banco PostgreSQL gratuito em https://neon.tech e copie a
   *connection string* (começa com `postgresql://`).
2. Aplique as tabelas nesse banco (no PowerShell, dentro de `crm-app`):

   ```powershell
   $env:DATABASE_URL="COLE_AQUI_A_CONNECTION_STRING"; npx prisma migrate deploy
   ```

3. Em https://vercel.com, importe o repositório do GitHub e defina:
   - **Root Directory:** `crm-app`
   - **Environment Variables:** `DATABASE_URL` (a do Neon), `SESSION_SECRET`
     (uma chave nova, veja `.env.example`) e `CODIGO_PRIMEIRO_ACESSO`
     (um código que só você saiba).
4. Depois do deploy, abra o endereço do site, faça o primeiro acesso usando o
   código e crie seu usuário. Depois disso, pode apagar `CODIGO_PRIMEIRO_ACESSO`.

Sempre que houver uma migração nova em `prisma/migrations`, repita o passo 2.

## Onde fica cada coisa

| Pasta / arquivo | O que tem |
|---|---|
| `prisma/schema.prisma` | Estrutura do banco (tabelas e relações) |
| `app/negocios/` | Funil de vendas (Kanban), ficha e edição de negócio |
| `app/contatos/`, `app/empresas/` | Cadastros |
| `app/atividades/`, `app/tarefas/` | Histórico e tarefas |
| `app/login/`, `app/primeiro-acesso/` | Entrada no sistema |
| `app/ui/` | Peças visuais reaproveitadas (campos, botões, menu) |
| `lib/` | Regras compartilhadas: banco, login, datas, dinheiro |
| `proxy.ts` | Manda para o login quem não está conectado |

O modelo de dados está descrito em `../modelo-de-dados.md`.
