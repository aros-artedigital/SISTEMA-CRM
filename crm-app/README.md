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
