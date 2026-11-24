// Aplica as migrações do banco (cria/atualiza as tabelas) antes do build.
//
// Na Vercel com Neon existem duas conexões:
// - DATABASE_URL: "com pool", boa para o site, que abre muitas conexões curtas;
// - DATABASE_URL_UNPOOLED: direta, necessária para migrações.
// Este script usa a direta quando ela existe.

import "dotenv/config"; // no seu computador, lê o .env (na Vercel não há .env)
import { spawnSync } from "node:child_process";

const env = { ...process.env };
if (env.DATABASE_URL_UNPOOLED) {
  env.DATABASE_URL = env.DATABASE_URL_UNPOOLED;
}

if (!env.DATABASE_URL) {
  console.log("DATABASE_URL não definida: pulando as migrações.");
  process.exit(0);
}

const resultado = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(resultado.status ?? 1);
