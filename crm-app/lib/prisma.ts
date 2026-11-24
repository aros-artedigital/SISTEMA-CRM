// Conexão única com o banco de dados.
//
// O Prisma usa o driver JavaScript do PostgreSQL (@prisma/adapter-pg),
// sem motor binário nativo: funciona igual no seu computador e na Vercel.
//
// Em desenvolvimento, o Next.js recarrega os arquivos a cada mudança.
// Sem este cuidado, cada recarga abriria uma conexão nova até esgotar o PostgreSQL.
// Por isso guardamos o cliente em `globalThis` e reaproveitamos.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

function criarCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalParaPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof criarCliente>;
};

export const prisma = globalParaPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
