// Consultas usadas pelas páginas de negócios.
// Ficam aqui para a página de cadastro e a de edição usarem as mesmas.
//
// "server-only" garante que este arquivo nunca vá parar no navegador
// (ele acessa o banco).
import "server-only";

import { prisma } from "@/lib/prisma";

// Listas para os campos "Contato" e "Empresa" do formulário.
export async function buscarOpcoes() {
  const [contatos, empresas] = await Promise.all([
    prisma.contato.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    prisma.empresa.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);
  return { contatos, empresas };
}
