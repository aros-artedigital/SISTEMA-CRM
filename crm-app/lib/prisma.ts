// Conexão única com o banco de dados.
//
// Em desenvolvimento, o Next.js recarrega os arquivos a cada mudança.
// Sem este cuidado, cada recarga abriria uma conexão nova até esgotar o PostgreSQL.
// Por isso guardamos o cliente em `globalThis` e reaproveitamos.
import { PrismaClient } from "@/app/generated/prisma/client";

const globalParaPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
